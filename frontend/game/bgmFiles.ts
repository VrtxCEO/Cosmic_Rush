/**
 * Individual BGM file overrides.
 * Add an entry here whenever a new BGM file is provided.
 * These replace the corresponding audiosprite segments.
 */
import { Howl } from 'howler';
import type { MusicName } from './sound';

const BGM_FILES: Partial<Record<MusicName, string>> = {
	'bgm_main':             '/assets/audio/bgm_main.mp3',
	'bgm_freespin':         '/assets/audio/bgm_freespin.mp3',
	// 'bgm_winlevel_big':  '/assets/audio/bgm_winlevel_big.mp3',
	// 'bgm_winlevel_epic': '/assets/audio/bgm_winlevel_epic.mp3',
	// 'bgm_winlevel_max':  '/assets/audio/bgm_winlevel_max.mp3',
	// 'bgm_winlevel_mega': '/assets/audio/bgm_winlevel_mega.mp3',
	// 'bgm_winlevel_superwin': '/assets/audio/bgm_winlevel_superwin.mp3',
};

const howls: Partial<Record<MusicName, Howl>> = {};
let currentName: MusicName | null = null;
let currentHowl: Howl | null = null;

function getHowl(name: MusicName): Howl {
	if (!howls[name]) {
		howls[name] = new Howl({ src: [BGM_FILES[name]!], loop: true, volume: 1 });
	}
	return howls[name]!;
}

export function hasBgmFile(name: MusicName): boolean {
	return name in BGM_FILES;
}

export function playBgm(name: MusicName): void {
	if (currentName === name && currentHowl?.playing()) return;
	stopBgm();
	currentName = name;
	currentHowl = getHowl(name);
	currentHowl.play();
}

export function stopBgm(): void {
	if (currentHowl) {
		currentHowl.stop();
		currentHowl = null;
		currentName = null;
	}
}

export function fadeBgm(from: number, to: number, duration: number): void {
	currentHowl?.fade(from, to, duration);
}

export function setBgmVolume(volume: number): void {
	for (const howl of Object.values(howls)) {
		howl?.volume(volume);
	}
}
