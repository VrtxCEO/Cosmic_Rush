import _ from 'lodash';
import { stateBet } from 'state-shared';
import { createPlayBookUtils } from 'utils-book';
import { createGetEmptyPaddedBoard } from 'utils-slots';

import { SYMBOL_SIZE, REEL_PADDING, SYMBOL_INFO_MAP, BOARD_DIMENSIONS } from './constants';
import { eventEmitter } from './eventEmitter';
import { stateGame, resizeBoard } from './stateGame.svelte';
import type { Bet, BookEventOfType } from './typesBookEvent';
import { bookEventHandlerMap } from './bookEventHandlerMap';
import type { RawSymbol, SymbolState } from './types';

// general utils
export const { getEmptyBoard } = createGetEmptyPaddedBoard({ reelsDimensions: BOARD_DIMENSIONS });
export const { playBookEvent, playBookEvents } = createPlayBookUtils({ bookEventHandlerMap });

const recoverFromPlayBookError = () => {
	// Reset core game state
	stateGame.gameType = 'basegame';
	stateGame.bonusType = null;
	stateGame.cosmicBreakCorners = [];
	stateGame.cosmicBreakMultiplier = 1;

	// Restore base grid if an 8x8 bonus was active
	if (
		stateGame.activeGridSize.reels !== BOARD_DIMENSIONS.x ||
		stateGame.activeGridSize.rows !== BOARD_DIMENSIONS.y
	) {
		resizeBoard(BOARD_DIMENSIONS.x, BOARD_DIMENSIONS.y);
	}

	// Force UI back to a safe baseline
	eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
	eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
	eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
	eventEmitter.broadcast({ type: 'cosmicBreakCornersHide' });
	eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
	eventEmitter.broadcast({ type: 'globalMultiplierHide' });
	eventEmitter.broadcast({ type: 'multiplierGridClear' });
	eventEmitter.broadcast({ type: 'multiplierGridHide' });
	eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
	eventEmitter.broadcast({ type: 'winHide' });
	eventEmitter.broadcast({ type: 'tumbleBoardHide' });
	eventEmitter.broadcast({ type: 'boardShow' });
	eventEmitter.broadcast({ type: 'drawerButtonHide' });
	eventEmitter.broadcast({ type: 'drawerUnfold' });
	eventEmitter.broadcast({ type: 'uiShow' });
};

export const playBet = async (bet: Bet) => {
	stateBet.winBookEventAmount = 0;
	try {
		await playBookEvents(bet.state);
	} catch (e) {
		console.error('[PLAYBET] playBookEvents error:', e);
		recoverFromPlayBookError();
	}
	eventEmitter.broadcast({ type: 'stopButtonEnable' });
};

// resume bet
const BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT = [
	'updateGlobalMult',
	'freeSpinTrigger',
	'updateFreeSpin',
	'setTotalWin',
];

export const convertTorResumableBet = (betToResume: Bet) => {
	const resumingIndex = Number(betToResume.event);
	const bookEventsBeforeResume = betToResume.state.filter(
		(_, eventIndex) => eventIndex < resumingIndex,
	);
	const bookEventsAfterResume = betToResume.state.filter(
		(_, eventIndex) => eventIndex >= resumingIndex,
	);

	const bookEventToCreateSnapshot: BookEventOfType<'createBonusSnapshot'> = {
		index: 0,
		type: 'createBonusSnapshot',
		bookEvents: bookEventsBeforeResume.filter((bookEvent) =>
			BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT.includes(bookEvent.type),
		),
	};

	const stateToResume = [bookEventToCreateSnapshot, ...bookEventsAfterResume];

	return { ...betToResume, state: stateToResume };
};

// other utils
export const getSymbolX = (reelIndex: number) => SYMBOL_SIZE * (reelIndex + REEL_PADDING);
export const getSymbolY = (symbolIndexOfBoard: number) => (symbolIndexOfBoard + 0.5) * SYMBOL_SIZE;

export const getSymbolKey = ({ rawSymbol }: { rawSymbol: RawSymbol }) => {
	if (!rawSymbol) return 'MET' as keyof typeof SYMBOL_INFO_MAP;
	if (rawSymbol.multiplier !== undefined) {
		return `${rawSymbol.name}${rawSymbol.multiplier}` as keyof typeof SYMBOL_INFO_MAP;
	}
	return rawSymbol.name as keyof typeof SYMBOL_INFO_MAP;
};

export const getSymbolInfo = ({
	rawSymbol,
	state,
}: {
	rawSymbol: RawSymbol;
	state: SymbolState;
}) => {
	const symbolKey = getSymbolKey({ rawSymbol });
	return (SYMBOL_INFO_MAP[symbolKey] ?? SYMBOL_INFO_MAP['PLU'])[state];
};
