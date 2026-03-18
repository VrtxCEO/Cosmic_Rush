import type { CornerState } from './typesBookEvent';

// ─── Cosmic Break Bonus Emitter Events ─────────────────────────────

export type EmitterEventCosmicBreak =
	| { type: 'cosmicBreakCornersShow' }
	| { type: 'cosmicBreakCornersHide' }
	| { type: 'cosmicBreakCornersInit'; corners: CornerState[] }
	| {
			type: 'cosmicBreakCornersUpdate';
			corners: CornerState[];
			newlyUnlocked: string[];
			currentMultiplier: number;
	  }
	| { type: 'cosmicBreakFullUnlockAnimate'; extraSpins: number }
	| {
			type: 'meteorLandAnimate';
			meteors: { reel: number; row: number; multiplier: number }[];
			newGlobalMultiplier: number;
	  };
