<script lang="ts">
	import { untrack } from 'svelte';
	import { Tween } from 'svelte/motion';

	import { Container, Sprite } from 'pixi-svelte';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import type { SymbolState } from '../game/types';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		oncomplete?: () => void;
	};

	const props: Props = $props();

	const CHAIN_DELAY  = 400;  // wait for lightning chain
	const WIN_DURATION = CHAIN_DELAY + 320;

	// Squash axes animate independently for cartoon pop
	const scaleXTween = new Tween(1, { duration: 0 });
	const scaleYTween = new Tween(1, { duration: 0 });
	const alphaTween  = new Tween(1, { duration: 0 });

	let phase1Timer: ReturnType<typeof setTimeout> | null = null;
	let winTimer:    ReturnType<typeof setTimeout> | null = null;

	// Cancel in-flight timers only — does NOT reset tweens
	function cancelWinAnim() {
		if (phase1Timer) { clearTimeout(phase1Timer); phase1Timer = null; }
		if (winTimer)    { clearTimeout(winTimer);    winTimer    = null; }
	}

	// Cancel timers AND snap tweens back to normal — used before starting a fresh anim
	function stopWinAnim() {
		cancelWinAnim();
		scaleXTween.set(1, { duration: 0 });
		scaleYTween.set(1, { duration: 0 });
		alphaTween.set(1,  { duration: 0 });
	}

	function playWinAnim(oncomplete: (() => void) | undefined) {
		stopWinAnim();
		if (!oncomplete) return;

		const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
		const easeIn  = (t: number) => t * t;

		// Phase 1 — wait for lightning, then squash
		phase1Timer = setTimeout(() => {
			scaleXTween.set(1.4, { duration: 90, easing: easeOut });
			scaleYTween.set(0.6, { duration: 90, easing: easeOut });
			// Phase 2 — implode to zero
			setTimeout(() => {
				scaleXTween.set(0, { duration: 200, easing: easeIn });
				scaleYTween.set(0, { duration: 200, easing: easeIn });
				alphaTween.set(0,  { duration: 160, easing: easeIn });
			}, 90);
		}, CHAIN_DELAY);

		winTimer = setTimeout(() => {
			winTimer = null;
			oncomplete();
		}, WIN_DURATION - 20);
	}

	$effect(() => {
		void props.symbolInfo;
		const state = props.state;

		if (state === 'win') {
			const cb = untrack(() => props.oncomplete);
			playWinAnim(cb);
		} else {
			// Only cancel timers — don't reset tweens so a completing win anim stays invisible
			cancelWinAnim();
			untrack(() => props.oncomplete?.());
		}

		return () => cancelWinAnim();
	});

	const ox = $derived(props.x ?? 0);
	const oy = $derived(props.y ?? 0);
</script>

<Container x={ox} y={oy} alpha={alphaTween.current}>
	<Sprite
		anchor={0.5}
		key={props.symbolInfo.assetKey}
		width={SYMBOL_SIZE  * props.symbolInfo.sizeRatios.width  * scaleXTween.current}
		height={SYMBOL_SIZE * props.symbolInfo.sizeRatios.height * scaleYTween.current}
	/>
</Container>
