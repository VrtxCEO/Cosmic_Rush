import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 100;

export const REEL_PADDING = 0.5;

// initial board (padded top and bottom) — 5 reels × 7 entries (5 visible + 2 padding)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{ name: 'PLU' },
		{ name: 'MER' },
		{ name: 'PLU' },
		{ name: 'VEN' },
		{ name: 'EAR' },
		{ name: 'PLU' },
		{ name: 'MER' },
	],
	[
		{ name: 'VEN' },
		{ name: 'MAR' },
		{ name: 'JUP' },
		{ name: 'PLU' },
		{ name: 'MER' },
		{ name: 'VEN' },
		{ name: 'EAR' },
	],
	[
		{ name: 'SAT' },
		{ name: 'PLU' },
		{ name: 'URA' },
		{ name: 'NEP' },
		{ name: 'MAR' },
		{ name: 'JUP' },
		{ name: 'PLU' },
	],
	[
		{ name: 'MER' },
		{ name: 'EAR' },
		{ name: 'SAT' },
		{ name: 'PLU' },
		{ name: 'VEN' },
		{ name: 'MER' },
		{ name: 'MAR' },
	],
	[
		{ name: 'NEP' },
		{ name: 'JUP' },
		{ name: 'VEN' },
		{ name: 'EAR' },
		{ name: 'URA' },
		{ name: 'PLU' },
		{ name: 'SAT' },
	],
];

export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 1; // background is 256x256 (1:1)
export const PORTRAIT_BACKGROUND_RATIO = 1; // same square background for portrait
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['NEP', 'URA', 'SAT', 'JUP', 'MAR'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const SPIN_OPTIONS_SHARED = {
	reelFallInDelay: 80,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 3.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.15,
	symbolFallInBounceSizeMulti: 0.5,
	symbolFallOutSpeed: 3.5,
	symbolFallOutInterval: 20,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 7,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 0.3,
	symbolFallInBounceSizeMulti: 0.25,
	symbolFallOutSpeed: 7,
	symbolFallOutInterval: 0,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

// Pixel art sprite definitions — all states use the same PNG for each symbol
const SYMBOL_RATIO = 0.9;
const SUN_RATIO = 1.1;

const sym = (key: string, ratio = SYMBOL_RATIO) =>
	({ type: 'sprite', assetKey: key, sizeRatios: { width: ratio, height: ratio } }) as const;

export const SYMBOL_INFO_MAP = {
	PLU: { static: sym('PLU.png'), spin: sym('PLU.png'), land: sym('PLU.png'), win: sym('PLU.png'), postWinStatic: sym('PLU.png'), explosion: sym('PLU.png') },
	MER: { static: sym('MER.png'), spin: sym('MER.png'), land: sym('MER.png'), win: sym('MER.png'), postWinStatic: sym('MER.png'), explosion: sym('MER.png') },
	VEN: { static: sym('VEN.png'), spin: sym('VEN.png'), land: sym('VEN.png'), win: sym('VEN.png'), postWinStatic: sym('VEN.png'), explosion: sym('VEN.png') },
	EAR: { static: sym('EAR.png'), spin: sym('EAR.png'), land: sym('EAR.png'), win: sym('EAR.png'), postWinStatic: sym('EAR.png'), explosion: sym('EAR.png') },
	MAR: { static: sym('MAR.png'), spin: sym('MAR.png'), land: sym('MAR.png'), win: sym('MAR.png'), postWinStatic: sym('MAR.png'), explosion: sym('MAR.png') },
	JUP: { static: sym('JUP.png'), spin: sym('JUP.png'), land: sym('JUP.png'), win: sym('JUP.png'), postWinStatic: sym('JUP.png'), explosion: sym('JUP.png') },
	SAT: { static: sym('SAT.png'), spin: sym('SAT.png'), land: sym('SAT.png'), win: sym('SAT.png'), postWinStatic: sym('SAT.png'), explosion: sym('SAT.png') },
	URA: { static: sym('URA.png'), spin: sym('URA.png'), land: sym('URA.png'), win: sym('URA.png'), postWinStatic: sym('URA.png'), explosion: sym('URA.png') },
	NEP: { static: sym('NEP.png'), spin: sym('NEP.png'), land: sym('NEP.png'), win: sym('NEP.png'), postWinStatic: sym('NEP.png'), explosion: sym('NEP.png') },
	SUN: { static: sym('sun.png', SUN_RATIO), spin: sym('sun.png', SUN_RATIO), land: sym('sun.png', SUN_RATIO), win: sym('sun.png', SUN_RATIO), postWinStatic: sym('sun.png', SUN_RATIO), explosion: sym('sun.png', SUN_RATIO) },
	MET:   { static: sym('MET.png'),   spin: sym('MET.png'),   land: sym('MET.png'),   win: sym('MET.png'),   postWinStatic: sym('MET.png'),   explosion: sym('MET.png') },
	MET2:  { static: sym('MET2.png'),  spin: sym('MET2.png'),  land: sym('MET2.png'),  win: sym('MET2.png'),  postWinStatic: sym('MET2.png'),  explosion: sym('MET2.png') },
	MET3:  { static: sym('MET3.png'),  spin: sym('MET3.png'),  land: sym('MET3.png'),  win: sym('MET3.png'),  postWinStatic: sym('MET3.png'),  explosion: sym('MET3.png') },
	MET4:  { static: sym('MET4.png'),  spin: sym('MET4.png'),  land: sym('MET4.png'),  win: sym('MET4.png'),  postWinStatic: sym('MET4.png'),  explosion: sym('MET4.png') },
	MET5:  { static: sym('MET5.png'),  spin: sym('MET5.png'),  land: sym('MET5.png'),  win: sym('MET5.png'),  postWinStatic: sym('MET5.png'),  explosion: sym('MET5.png') },
	MET6:  { static: sym('MET6.png'),  spin: sym('MET6.png'),  land: sym('MET6.png'),  win: sym('MET6.png'),  postWinStatic: sym('MET6.png'),  explosion: sym('MET6.png') },
	MET7:  { static: sym('MET7.png'),  spin: sym('MET7.png'),  land: sym('MET7.png'),  win: sym('MET7.png'),  postWinStatic: sym('MET7.png'),  explosion: sym('MET7.png') },
	MET8:  { static: sym('MET8.png'),  spin: sym('MET8.png'),  land: sym('MET8.png'),  win: sym('MET8.png'),  postWinStatic: sym('MET8.png'),  explosion: sym('MET8.png') },
	MET9:  { static: sym('MET9.png'),  spin: sym('MET9.png'),  land: sym('MET9.png'),  win: sym('MET9.png'),  postWinStatic: sym('MET9.png'),  explosion: sym('MET9.png') },
	MET10: { static: sym('MET10.png'), spin: sym('MET10.png'), land: sym('MET10.png'), win: sym('MET10.png'), postWinStatic: sym('MET10.png'), explosion: sym('MET10.png') },
} as const;

export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
} as const;
