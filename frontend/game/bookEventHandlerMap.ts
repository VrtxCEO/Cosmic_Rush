import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet } from 'state-shared';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived, resizeBoard, type BonusType } from './stateGame.svelte';
import { BOARD_DIMENSIONS } from './constants';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';

// ─── Helpers ─────────────────────────────────────────────────────

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
	}
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions, clusters, animationType = 'win' }: { positions: Position[]; clusters?: Position[][]; animationType?: 'win' | 'scatter' }) => {
	if (!positions || positions.length === 0) return;
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
		clusters,
		animationType,
	});
};

/** Resolve bonusType from RGS event.
 *  The book data always includes bonusType as a field:
 *  - "cosmicBreak" | null
 *  null means a standard freespin (e.g. wincap distribution) with no bonus-specific mechanics. */
const resolveBonusType = (bookEvent: BookEventOfType<'freeSpinTrigger'>): BonusType => {
	return bookEvent.bonusType ?? null;
};

/** Reset all bonus-specific state */
const resetBonusState = () => {
	stateGame.bonusType = null;
	stateGame.cosmicBreakCorners = [];
	stateGame.cosmicBreakMultiplier = 1;
	stateBet.activeBetModeKey = 'BASE';
	console.log('[resetBonusState] activeBetModeKey =', stateBet.activeBetModeKey);
};

// ─── Shared bonus trigger flow ───────────────────────────────────

const sharedBonusTriggerFlow = async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
	// Animate scatters (skip for random triggers with no scatter positions)
	if ((bookEvent.positions?.length ?? 0) > 0) {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions, animationType: 'scatter' });
	}

	// Bonus stinger — plays right as scatters finish landing
	eventEmitter.broadcast({ type: 'soundBonusStinger' });

	// Transition
	await eventEmitter.broadcastAsync({ type: 'uiHide' });
	await eventEmitter.broadcastAsync({ type: 'transition' });

	// Intro panel
	eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
	eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	await eventEmitter.broadcastAsync({
		type: 'freeSpinIntroUpdate',
		totalFreeSpins: bookEvent.totalFs,
	});

	stateGame.gameType = 'freegame';
	eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
};

const sharedBonusUISetup = async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
	eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
	eventEmitter.broadcast({
		type: 'freeSpinCounterUpdate',
		current: undefined,
		total: bookEvent.totalFs,
	});
	await eventEmitter.broadcastAsync({ type: 'uiShow' });
};

// ─── Handler Map ─────────────────────────────────────────────────

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	// ─── Reveal (all modes) ──────────────────────────────────────
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
		stateGame.gameType = bookEvent.gameType;
		console.log('[reveal] spin start, gameType:', bookEvent.gameType, 'gridSize:', stateGame.activeGridSize);
		await stateGameDerived.enhancedBoard.spin({ revealEvent: bookEvent });
		console.log('[reveal] spin done');
	},

	// ─── Win Info (all modes) ────────────────────────────────────
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		const promise1 = async () => {
				await animateSymbols({ positions: _.flatten(bookEvent.wins.map((win) => win.positions)), clusters: bookEvent.wins.map((win) => win.positions) });
		};

		const promise2 = async () => {
			await eventEmitter.broadcastAsync({
				type: 'showClusterWinAmounts',
				wins: bookEvent.wins.map((win) => {
					return {
						win: win.meta.winWithoutMult,
						mult: win.meta.globalMult,
						result: win.meta.winWithoutMult * win.meta.globalMult,
						reel: win.meta.overlay.reel,
						row: win.meta.overlay.row,
					};
				}),
			});
		};

		await Promise.all([promise1(), promise2()]);
	},

	// ─── Tumble / Cascade ────────────────────────────────────────
	updateTumbleWin: async (bookEvent: BookEventOfType<'updateTumbleWin'>) => {
		if (bookEvent.amount > 0) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
			eventEmitter.broadcast({
				type: 'tumbleWinAmountUpdate',
				amount: bookEvent.amount,
				animate: false,
			});
		}
	},
	tumbleBoard: async (bookEvent: BookEventOfType<'tumbleBoard'>) => {
		eventEmitter.broadcast({ type: 'boardHide' });
		eventEmitter.broadcast({ type: 'tumbleBoardShow' });
		eventEmitter.broadcast({ type: 'tumbleBoardInit', addingBoard: bookEvent.newSymbols });
		await eventEmitter.broadcastAsync({
			type: 'tumbleBoardExplode',
			explodingPositions: bookEvent.explodingSymbols,
		});
		eventEmitter.broadcast({ type: 'tumbleBoardRemoveExploded' });
		await eventEmitter.broadcastAsync({ type: 'tumbleBoardSlideDown' });
		eventEmitter.broadcast({
			type: 'boardSettle',
			board: stateGameDerived
				.tumbleBoardCombined()
				.map((tumbleReel) => tumbleReel.map((tumbleSymbol) => tumbleSymbol.rawSymbol)),
		});
		eventEmitter.broadcast({ type: 'tumbleBoardReset' });
		eventEmitter.broadcast({ type: 'tumbleBoardHide' });
		eventEmitter.broadcast({ type: 'boardShow' });
	},

	// ─── Win / Total ─────────────────────────────────────────────
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];
		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	updateGrid: async (_bookEvent: BookEventOfType<'updateGrid'>) => {
		// Grid multipliers disabled — not part of this game's design
	},
	finalWin: async (_bookEvent: BookEventOfType<'finalWin'>) => {
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
	},

	// ─── Free Spin Shared ────────────────────────────────────────
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount,
			total: bookEvent.total,
		});
	},
	updateGlobalMult: async (bookEvent: BookEventOfType<'updateGlobalMult'>) => {
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		if (bookEvent.globalMult === 1) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		}
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: bookEvent.globalMult,
		});
	},

	// ─── Free Spin Trigger (bonus-specific branching) ────────────
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// Guard: if already in freegame, this is a duplicate call — skip it
		if (stateGame.gameType === 'freegame') return;

		const bonusType = resolveBonusType(bookEvent);
		stateGame.bonusType = bonusType;

		// Shared: animate scatters → transition → intro → gameType
		await sharedBonusTriggerFlow(bookEvent);

		// Bonus-specific setup (transition is covering the screen at this point)
		if (bonusType === 'cosmicBreak') {
			resizeBoard(8, 8);
			eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
			eventEmitter.broadcast({ type: 'globalMultiplierShow' });
			await eventEmitter.broadcastAsync({ type: 'globalMultiplierUpdate', multiplier: 1 });
			await eventEmitter.broadcastAsync({ type: 'cosmicBreakCornersShow' });
		}

		// Shared: spin counter + UI
		await sharedBonusUISetup(bookEvent);
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},

	// ─── Free Spin Retrigger ─────────────────────────────────────
	freeSpinRetrigger: async (bookEvent: BookEventOfType<'freeSpinRetrigger'>) => {
		// Retrigger just adds more spins — no transition/intro replay
		if ((bookEvent.positions?.length ?? 0) > 0) {
			await animateSymbols({ positions: bookEvent.positions, animationType: 'scatter' });
		}

		// Update the free spin counter with the new total
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
	},

	// ─── Free Spin End (bonus-specific cleanup) ──────────────────
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		console.log('[FSE] 1 uiHide');
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';

		// Bonus-specific cleanup
		eventEmitter.broadcast({ type: 'cosmicBreakCornersHide' });

		// Shared cleanup
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });

		console.log('[FSE] 2 outro');
		try {
			eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
			winLevelSoundsPlay({ winLevelData });
			await eventEmitter.broadcastAsync({
				type: 'freeSpinOutroCountUp',
				amount: bookEvent.amount,
				winLevelData,
			});
			winLevelSoundsStop();
		} catch (e) {
			console.warn('[FSE] outro failed:', e);
			winLevelSoundsStop();
		}

		console.log('[FSE] 3 transition');
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });

		console.log('[FSE] 4 resize+boardShow');
		if (
			stateGame.activeGridSize.reels !== BOARD_DIMENSIONS.x ||
			stateGame.activeGridSize.rows !== BOARD_DIMENSIONS.y
		) {
			resizeBoard(BOARD_DIMENSIONS.x, BOARD_DIMENSIONS.y);
		}
		eventEmitter.broadcast({ type: 'boardShow' });

		// Reset bonus state BEFORE showing UI so activeBetModeKey is 'BASE'
		// before the spin button or drawer becomes interactive.
		resetBonusState();

		console.log('[FSE] 5 uiShow');
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		console.log('[FSE] 6 drawerUnfold');
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		console.log('[FSE] 7 done');
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},

	// ─── Meteor Multiplier ───────────────────────────────────────

	meteorLand: async (bookEvent: BookEventOfType<'meteorLand'>) => {
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: bookEvent.newGlobalMultiplier,
		});
		// Overlay animation fires non-blocking so it can't hang the event chain
		eventEmitter.broadcast({
			type: 'meteorLandAnimate',
			meteors: bookEvent.meteors,
			newGlobalMultiplier: bookEvent.newGlobalMultiplier,
		});
	},

	// ─── Cosmic Break Bonus Handlers ─────────────────────────────

	cosmicBreakInit: async (bookEvent: BookEventOfType<'cosmicBreakInit'>) => {
		stateGame.cosmicBreakCorners = bookEvent.corners;
		await eventEmitter.broadcastAsync({
			type: 'cosmicBreakCornersInit',
			corners: bookEvent.corners,
		});
	},

	cosmicBreakCornerUpdate: async (bookEvent: BookEventOfType<'cosmicBreakCornerUpdate'>) => {
		const prevMultiplier = stateGame.cosmicBreakMultiplier;
		stateGame.cosmicBreakCorners = bookEvent.corners;
		stateGame.cosmicBreakMultiplier = bookEvent.currentMultiplier;

		await eventEmitter.broadcastAsync({
			type: 'cosmicBreakCornersUpdate',
			corners: bookEvent.corners,
			newlyUnlocked: bookEvent.newlyUnlocked,
			currentMultiplier: bookEvent.currentMultiplier,
		});

		if (bookEvent.currentMultiplier !== prevMultiplier) {
			await eventEmitter.broadcastAsync({
				type: 'globalMultiplierUpdate',
				multiplier: bookEvent.currentMultiplier,
			});
		}

		if (bookEvent.extraSpinsAdded > 0) {
			await eventEmitter.broadcastAsync({
				type: 'cosmicBreakFullUnlockAnimate',
				extraSpins: bookEvent.extraSpinsAdded,
			});
		}
	},

	cosmicBreakFullUnlock: async (bookEvent: BookEventOfType<'cosmicBreakFullUnlock'>) => {
		await eventEmitter.broadcastAsync({
			type: 'cosmicBreakFullUnlockAnimate',
			extraSpins: bookEvent.extraSpins,
		});
	},

	// ─── Win Cap ────────────────────────────────────────────────
	wincap: async () => {
		// Win cap already applied server-side; amount tracked via setTotalWin
	},

	// ─── Bonus Snapshot (resume) ─────────────────────────────────

	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });
	},
};
