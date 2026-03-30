<script lang="ts" module>
	import { type MusicName, type SoundEffectName, type SoundName } from '../game/sound';

	export type EmitterEventSound =
		| { type: 'soundMusic'; name: MusicName }
		| { type: 'soundOnce'; name: SoundEffectName; forcePlay?: boolean }
		| { type: 'soundLoop'; name: SoundEffectName }
		| { type: 'soundStop'; name: SoundName }
		| { type: 'soundFade'; name: SoundName; from: number; to: number; duration: number }
		| { type: 'soundScatterCounterIncrease' }
		| { type: 'soundScatterCounterClear' }
	| { type: 'soundBonusStinger' }
	| { type: 'soundExtraSpins' }
	| { type: 'soundWinPop' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';

	import { waitForTimeout } from 'utils-shared/wait';
	import { SECOND } from 'constants-shared/time';
	import { stateBet, stateSound, stateSoundDerived } from 'state-shared';

	import { getContext } from '../game/context';
	import { playBgm, setBgmVolume } from '../game/bgmFiles';
	import type { MusicName } from '../game/sound';

	const context = getContext();

	// ── Individual SFX files ──────────────────────────────────────────────────
	const base = import.meta.env.BASE_URL;
	const hitSound = new Howl({ src: [`${base}assets/audio/Hit_Sound.mp3`], volume: 1 });
	const bonusStinger = new Howl({ src: [`${base}assets/audio/bonus_stinger.mp3`], volume: 1 });
	const extraSpinsSound = new Howl({ src: [`${base}assets/audio/sfx_extra_spins.mp3`], volume: 1 });
	const winPopSound = new Howl({ src: [`${base}assets/audio/sfx_win_pop.mp3`], volume: 1 });
	const coinLoopSound = new Howl({ src: [`${base}assets/audio/sfx_coinloop.mp3`], volume: 1 });
	const scatterStopSound = new Howl({ src: [`${base}assets/audio/sfx_scatter_stop.mp3`], volume: 1 });
	const reelStopSound = new Howl({
		src: [`${base}assets/audio/sounds.mp3`],
		sprite: {
			sfx_reel_stop_1: [325000, 244],
			sfx_reel_stop_2: [327000, 247],
			sfx_reel_stop_3: [329000, 241],
			sfx_reel_stop_4: [331000, 242],
			sfx_reel_stop_5: [333000, 240],
			sfx_scatter_win_v2: [356000, 3670],
		},
		volume: 1,
	});
	let scatterSoundLocked = false;

	const sfxHowls = [hitSound, bonusStinger, extraSpinsSound, winPopSound, coinLoopSound, scatterStopSound, reelStopSound];

	$effect(() => {
		const sfxVol = stateSoundDerived.volumeSoundEffect();
		for (const h of sfxHowls) h.volume(sfxVol);
	});

	$effect(() => {
		setBgmVolume(stateSoundDerived.volumeMusic());
	});

	// ── Music routing ─────────────────────────────────────────────────────────
	function playMusic(name: MusicName) {
		playBgm(name);
	}

	context.eventEmitter.subscribeOnMount({
		// ui
		soundBetMode: async ({ betModeKey }) => {
			if (betModeKey === 'SUPERSPIN') {
				await waitForTimeout(SECOND);
				playMusic('bgm_freespin');
			} else {
				playMusic('bgm_main');
			}
		},
		soundPressGeneral: () => {},
		soundPressBet: () => {},
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => { context.stateGame.scatterCounter = 0; scatterSoundLocked = false; },
		// game
		soundMusic: ({ name }) => playMusic(name as MusicName),
		soundLoop: ({ name }) => {
			if (name === 'sfx_bigwin_coinloop') { coinLoopSound.play(); return; }
		},
		soundOnce: ({ name }) => {
			if (name === 'sfx_scatter_stop_1' || name === 'sfx_scatter_stop_2' || name === 'sfx_scatter_stop_3' || name === 'sfx_scatter_stop_4') { if (!scatterSoundLocked) scatterStopSound.play(); return; }
			if (name === 'sfx_reel_stop_1' || name === 'sfx_reel_stop_2' || name === 'sfx_reel_stop_3' || name === 'sfx_reel_stop_4' || name === 'sfx_reel_stop_5') { reelStopSound.play(name); return; }
			if (name === 'sfx_scatter_win_v2') { reelStopSound.play('sfx_scatter_win_v2'); return; }
		},
		soundStop: ({ name }) => {
			if (name === 'sfx_bigwin_coinloop') { coinLoopSound.stop(); return; }
		},
		soundFade: async () => {},
		// hit sound
		tumbleBoardShow: () => { scatterSoundLocked = true; },
		boardWithAnimateSymbols: () => hitSound.play(),
		soundBonusStinger: () => bonusStinger.play(),
		soundExtraSpins: () => extraSpinsSound.play(),
		soundWinPop: () => winPopSound.play(),
	});

	onMount(() => {
		if (stateBet.activeBetModeKey === 'SUPERSPIN') {
			playMusic('bgm_freespin');
		} else {
			playMusic('bgm_main');
		}
	});
</script>
