import _ from 'lodash';
import type { Tween } from 'svelte/motion';

import { stateBet } from 'state-shared';
import { createEnhanceBoard, createReelForCascading } from 'utils-slots';
import { createGetWinLevelDataByWinLevelAlias } from 'utils-shared/winLevel';

import type { GameType, RawSymbol, SymbolState } from './types';
import type { CornerState } from './typesBookEvent';

export type BonusType = 'cosmicBreak' | null;
import { stateLayoutDerived } from './stateLayout';
import { winLevelMap } from './winLevelMap';
import { eventEmitter } from './eventEmitter';
import {
	SYMBOL_SIZE,
	BOARD_SIZES,
	INITIAL_BOARD,
	BOARD_DIMENSIONS,
	SPIN_OPTIONS_DEFAULT,
	SPIN_OPTIONS_FAST,
	INITIAL_SYMBOL_STATE,
	SCATTER_LAND_SOUND_MAP,
} from './constants';

const onSymbolLand = ({ rawSymbol, symbolIndexOfBoard }: { rawSymbol: RawSymbol; symbolIndexOfBoard: number }) => {
	if (rawSymbol.name === 'SUN' && symbolIndexOfBoard >= 0 && symbolIndexOfBoard < stateGame.activeGridSize.rows) {
		eventEmitter.broadcast({ type: 'soundScatterCounterIncrease' });
		eventEmitter.broadcast({
			type: 'soundOnce',
			name: SCATTER_LAND_SOUND_MAP[scatterLandIndex()],
		});
	}


};

/** Create a single cascading reel from an initial symbols array. */
const createReel = (reelIndex: number, initialSymbols: RawSymbol[]) => {
	const reel = createReelForCascading({
		reelIndex,
		symbolHeight: SYMBOL_SIZE,
		initialSymbols,
		initialSymbolState: INITIAL_SYMBOL_STATE,
		onReelStopping: () => {
			eventEmitter.broadcast({
				type: 'soundOnce',
				name: 'sfx_reel_stop_1',
				forcePlay: !stateBet.isTurbo,
			});
		},
		onSymbolLand,
	});

	reel.reelState.spinOptions = () =>
		reel.reelState.spinType === 'fast' ? SPIN_OPTIONS_FAST : SPIN_OPTIONS_DEFAULT;

	return reel;
};

const board = INITIAL_BOARD.map((initialSymbols, reelIndex) =>
	createReel(reelIndex, initialSymbols),
);

export type Reel = (typeof board)[number];
export type ReelSymbol = Reel['reelState']['symbols'][number];

export type TumbleSymbol = {
	symbolY: Tween<number>;
	rawSymbol: RawSymbol;
	symbolState: SymbolState;
	oncomplete: () => void;
};

export type MultiplierSymbol = {
	initX: number;
	initY: number;
	symbolX: Tween<number>;
	symbolY: Tween<number>;
	rawSymbol: RawSymbol;
	symbolState: SymbolState;
	oncomplete: () => void;
};

export const stateGame = $state({
	board,
	gameType: 'basegame' as GameType,
	tumbleBoardAdding: [] as TumbleSymbol[][],
	tumbleBoardBase: [] as TumbleSymbol[][],
	multiplierBoard: [] as (MultiplierSymbol | undefined)[][],
	scatterCounter: 0,
	bonusType: null as BonusType,

	// Active grid dimensions — changes for 8x8 bonuses
	activeGridSize: { reels: BOARD_DIMENSIONS.x, rows: BOARD_DIMENSIONS.y },

	// Cosmic Break bonus state
	cosmicBreakCorners: [] as CornerState[],
	cosmicBreakMultiplier: 1,
});

/**
 * Rebuild the board with a different grid size.
 * Call during a transition (screen covered) to avoid visual glitches.
 */
export const resizeBoard = (reels: number, rows: number) => {
	const entriesPerReel = rows + 2; // visible rows + top/bottom padding
	const placeholderBoard: RawSymbol[][] = _.range(reels).map(() =>
		_.range(entriesPerReel).map(() => ({ name: 'MET' as RawSymbol['name'] })),
	);

	// Mutate the existing board array so reactive references stay valid
	stateGame.board.length = 0;
	stateGame.board.push(
		...placeholderBoard.map((syms, i) => createReel(i, syms)),
	);

	// Recreate enhanced board for the new reel set
	const { enhanceBoard: createNewEnhanced } = createEnhanceBoard();
	_enhancedBoard = createNewEnhanced({ board: stateGame.board });
	_enhancedBoardVersion++;

	stateGame.activeGridSize = { reels, rows };
};

/** Frame layout — always matches the base 5x5 frame size. */
const boardLayout = () => ({
	x: stateLayoutDerived.mainLayout().width * 0.5,
	y: stateLayoutDerived.mainLayout().height * 0.5,
	anchor: { x: 0.5, y: 0.5 },
	pivot: {
		x: (SYMBOL_SIZE * stateGame.activeGridSize.reels) / 2,
		y: (SYMBOL_SIZE * stateGame.activeGridSize.rows) / 2,
	},
	...BOARD_SIZES,
});

/** Uniform scale applied to BoardContainer so 8x8 fits in the same frame. */
const boardScale = () =>
	BOARD_SIZES.width / (SYMBOL_SIZE * stateGame.activeGridSize.reels);

/** Content dimensions in local (pre-scale) coordinates. */
const boardLocalSize = () => ({
	width: SYMBOL_SIZE * stateGame.activeGridSize.reels,
	height: SYMBOL_SIZE * stateGame.activeGridSize.rows,
});

const boardRaw = () =>
	stateGame.board.map((reel) => reel.reelState.symbols.map((reelSymbol) => reelSymbol.rawSymbol));

const tumbleBoardCombined = () => {
	const tumbleBoardCombined = stateGame.tumbleBoardBase.map((tumbleReelBase, reelIndex) => {
		const tumbleReelAdding = stateGame.tumbleBoardAdding[reelIndex] ?? [];
		return [...tumbleReelAdding, ...tumbleReelBase];
	});

	return tumbleBoardCombined;
};

const scatterLandIndex = () => {
	if (stateGame.scatterCounter > 5) return 5;
	if (stateGame.scatterCounter < 1) return 1;
	return stateGame.scatterCounter as 1 | 2 | 3 | 4 | 5;
};

const { enhanceBoard } = createEnhanceBoard();
let _enhancedBoard = enhanceBoard({ board: stateGame.board });
let _enhancedBoardVersion = $state(0);

// win levels

export const { getWinLevelDataByWinLevelAlias } = createGetWinLevelDataByWinLevelAlias({
	winLevelMap,
});

export const stateGameDerived = {
	onSymbolLand,
	boardLayout,
	boardScale,
	boardLocalSize,
	boardRaw,
	tumbleBoardCombined,
	scatterLandIndex,
	get enhancedBoard() {
		return _enhancedBoard;
	},
	get enhancedBoardVersion() {
		return _enhancedBoardVersion;
	},
	getWinLevelDataByWinLevelAlias,
};
