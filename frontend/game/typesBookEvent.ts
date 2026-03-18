import type { BetType } from 'rgs-requests';

import type { SymbolName, RawSymbol, GameType, Position } from './types';
import type { BonusType } from './stateGame.svelte';

// ─── Shared Events ───────────────────────────────────────────────

type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	anticipation: number[];
	gameType: GameType;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: {
		symbol: SymbolName;
		win: number;
		positions: Position[];
		meta: {
			globalMult: number;
			clusterMult: number;
			winWithoutMult: number;
			overlay: Position;
		};
	}[];
};

type BookEventSetTumbleWin = {
	index: number;
	type: 'updateTumbleWin';
	amount: number;
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFreeSpinTrigger = {
	index: number;
	type: 'freeSpinTrigger';
	totalFs: number;
	positions: Position[];
	bonusType?: BonusType; // RGS is source of truth — optional until RGS sends it
};

type BookEventUpdateFreeSpin = {
	index: number;
	type: 'updateFreeSpin';
	amount: number;
	total: number;
};

type BookEventUpdateGlobalMult = {
	index: number;
	type: 'updateGlobalMult';
	globalMult: number;
};

type BookEventFreeSpinEnd = {
	index: number;
	type: 'freeSpinEnd';
	amount: number;
	winLevel: number;
};

type BookEventTumbleBoard = {
	index: number;
	type: 'tumbleBoard';
	explodingSymbols: Position[];
	newSymbols: RawSymbol[][];
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

type BookEventSetWin = {
	index: number;
	type: 'setWin';
	amount: number;
	winLevel: number;
};

type BookEventUpdateGrid = {
	index: number;
	type: 'updateGrid';
	gridMultipliers: number[][];
};

type BookEventFreeSpinRetrigger = {
	index: number;
	type: 'freeSpinRetrigger';
	totalFs: number;
	positions: Position[];
};

// customised
type BookEventCreateBonusSnapshot = {
	index: number;
	type: 'createBonusSnapshot';
	bookEvents: BookEvent[];
};

// ─── Meteor Multiplier Event ─────────────────────────────────────

type BookEventMeteorLand = {
	index: number;
	type: 'meteorLand';
	meteors: { reel: number; row: number; multiplier: number }[];
	newGlobalMultiplier: number;
};

// ─── Cosmic Break Bonus Events ─────────────────────────────────────

export type CornerState = {
	id: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
	hitsRequired: number;
	hitsReceived: number;
	unlocked: boolean;
};

type BookEventCosmicBreakInit = {
	index: number;
	type: 'cosmicBreakInit';
	gridSize: number;
	corners: CornerState[];
};

type BookEventCosmicBreakCornerUpdate = {
	index: number;
	type: 'cosmicBreakCornerUpdate';
	corners: CornerState[];
	newlyUnlocked: string[];
	currentMultiplier: number;
	extraSpinsAdded: number;
};

type BookEventCosmicBreakFullUnlock = {
	index: number;
	type: 'cosmicBreakFullUnlock';
	extraSpins: number;
};

// ─── Win Cap ────────────────────────────────────────────────────

type BookEventWinCap = {
	index: number;
	type: 'wincap';
	amount: number;
};

// ─── Union ───────────────────────────────────────────────────────

export type BookEvent =
	| BookEventReveal
	| BookEventWinInfo
	| BookEventSetTumbleWin
	| BookEventSetTotalWin
	| BookEventFreeSpinTrigger
	| BookEventUpdateFreeSpin
	| BookEventUpdateGlobalMult
	| BookEventTumbleBoard
	| BookEventFinalWin
	| BookEventSetWin
	| BookEventFreeSpinEnd
	| BookEventUpdateGrid
	| BookEventFreeSpinRetrigger
	| BookEventCreateBonusSnapshot
	// Meteor multiplier
	| BookEventMeteorLand
	// Cosmic Break
	| BookEventCosmicBreakInit
	| BookEventCosmicBreakCornerUpdate
	| BookEventCosmicBreakFullUnlock
	// Win Cap
	| BookEventWinCap;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
