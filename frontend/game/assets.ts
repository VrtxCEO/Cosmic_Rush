export default {
	// --- Fonts (BitmapFont) ---
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
		preload: true,
	},
	purpleFont: {
		type: 'font',
		src: new URL('../../assets/fonts/purpleFont/mm_purple.xml', import.meta.url).href,
		preload: true,
	},
	neonFont: {
		type: 'font',
		src: new URL('../../assets/fonts/neonFont/neon_font.xml', import.meta.url).href,
		preload: true,
	},

	// --- Pixel Art Background ---
	background: {
		type: 'sprite',
		src: new URL('../../assets/background/Space_BackGround.png', import.meta.url).href,
		preload: true,
	},

	// --- Pixel Art Symbol sprites ---
	'NEP.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/NEP.png', import.meta.url).href,
	},
	'URA.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/URA.png', import.meta.url).href,
	},
	'SAT.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/SAT.png', import.meta.url).href,
	},
	'JUP.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/JUP.png', import.meta.url).href,
	},
	'MAR.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/MAR.png', import.meta.url).href,
	},
	'EAR.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/EAR.png', import.meta.url).href,
	},
	'VEN.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/VEN.png', import.meta.url).href,
	},
	'MER.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/MER.png', import.meta.url).href,
	},
	'PLU.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/PLU.png', import.meta.url).href,
	},
	// Wild symbol (asteroid rock with W)
	'MET.png':   { type: 'sprite', src: new URL('../../assets/sprites/met_wild.png', import.meta.url).href },
	'sun.png': {
		type: 'sprite',
		src: new URL('../../assets/symbols/sun.png', import.meta.url).href,
	},

	// --- Pixel Art UI sprites ---
	'LockZone.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/LockZone.png', import.meta.url).href,
	},
	'corner_locked.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/corner_locked.png', import.meta.url).href,
	},
	'corner_unlocked.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/corner_unlocked.png', import.meta.url).href,
	},
	'board_frame.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/board_frame.png', import.meta.url).href,
	},
	'Reel_House.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/Reel_House.png', import.meta.url).href,
	},
	'asteroid_large_1.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/asteroid_large_1.png', import.meta.url).href,
	},
	'asteroid_square_1.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/asteroid_square_1.png', import.meta.url).href,
	},
	'asteroid_large_2.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/asteroid_large_2.png', import.meta.url).href,
	},
	'asteroid_med_2.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/asteroid_med_2.png', import.meta.url).href,
	},
	'asteroid_small_1.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/asteroid_small_1.png', import.meta.url).href,
	},
	'asteroid_small_2.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/asteroid_small_2.png', import.meta.url).href,
	},
	'frame_bg.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/frame_bg.png', import.meta.url).href,
	},
	'frame_edge.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/frame_edge.png', import.meta.url).href,
	},
	'Frame_FSCounter.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/Frame_FSCounter.png', import.meta.url).href,
	},
	'ship_fighter.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ship_fighter.png', import.meta.url).href,
	},
	'ship_dark.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ship_dark.png', import.meta.url).href,
	},
	'ship_shuttle.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ship_shuttle.png', import.meta.url).href,
	},
	'arc_rail.png':    { type: 'sprite', src: new URL('../../assets/sprites/arc_rail.png',    import.meta.url).href },
	'GlassDisplay.png': { type: 'sprite', src: new URL('../../assets/sprites/GlassDisplay.png', import.meta.url).href },
	'plus_sign.png':    { type: 'sprite', src: new URL('../../assets/sprites/plus_sign.png',    import.meta.url).href },
	'minus_sign.png':   { type: 'sprite', src: new URL('../../assets/sprites/minus_sign.png',   import.meta.url).href },
	'BuyBonus.png':     { type: 'sprite', src: new URL('../../assets/sprites/BuyBonus.png',     import.meta.url).href },
	'turbo_bolt.png':  { type: 'sprite', src: new URL('../../assets/sprites/turbo_bolt.png',  import.meta.url).href },
	'spin_button.png': { type: 'sprite', src: new URL('../../assets/sprites/spin_button.png', import.meta.url).href },
	'ui_button.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui_button.png', import.meta.url).href,
	},
	'ui_stat_frame.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui_stat_frame.png', import.meta.url).href,
	},
	'MET2.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET2.png',  import.meta.url).href },
	'MET3.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET3.png',  import.meta.url).href },
	'MET4.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET4.png',  import.meta.url).href },
	'MET5.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET5.png',  import.meta.url).href },
	'MET6.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET6.png',  import.meta.url).href },
	'MET7.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET7.png',  import.meta.url).href },
	'MET8.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET8.png',  import.meta.url).href },
	'MET9.png':  { type: 'sprite', src: new URL('../../assets/sprites/MET9.png',  import.meta.url).href },
	'MET10.png': { type: 'sprite', src: new URL('../../assets/sprites/MET10.png', import.meta.url).href },
	'ship_interceptor.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ship_interceptor.png', import.meta.url).href,
	},
	'ship_warship.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ship_warship.png', import.meta.url).href,
	},
	'ship_scout.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/ship_scout.png', import.meta.url).href,
	},
	'num_0.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/0.png', import.meta.url).href },
	'num_1.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/1.png', import.meta.url).href },
	'num_2.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/2.png', import.meta.url).href },
	'num_3.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/3.png', import.meta.url).href },
	'num_4.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/4.png', import.meta.url).href },
	'num_5.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/5.png', import.meta.url).href },
	'num_6.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/6.png', import.meta.url).href },
	'num_7.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/7.png', import.meta.url).href },
	'num_8.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/8.png', import.meta.url).href },
	'num_9.png': { type: 'sprite', src: new URL('../../assets/sprites/numbers/9.png', import.meta.url).href },
	'multiplier_badge.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/multiplier_badge.png', import.meta.url).href,
	},
	'win_panel.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/win_panel.png', import.meta.url).href,
	},
	'freespin_intro.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/freespin_intro.png', import.meta.url).href,
	},
	'logo.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/logo.png', import.meta.url).href,
	},
	'coins.png': {
		type: 'sprite',
		src: new URL('../../assets/sprites/coins.png', import.meta.url).href,
	},

	// --- FX sprites (PixelLab generated) ---
	'fx_particle.png':  { type: 'sprite', src: new URL('../../assets/sprites/fx_particle.png',  import.meta.url).href },
	'fx_shockwave.png': { type: 'sprite', src: new URL('../../assets/sprites/fx_shockwave.png', import.meta.url).href },
	'fx_glow.png':      { type: 'sprite', src: new URL('../../assets/sprites/fx_glow.png',      import.meta.url).href },
	'fx_starburst.png': { type: 'sprite', src: new URL('../../assets/sprites/fx_starburst.png', import.meta.url).href },

	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
