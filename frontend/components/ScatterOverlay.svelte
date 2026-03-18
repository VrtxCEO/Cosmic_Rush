<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import BoardContainer from './BoardContainer.svelte';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import type { Position } from '../game/types';

	const context = getContext();

	// ── Constants ─────────────────────────────────────────────────────────────
	const BURST_DURATION  = 600;   // ms starburst expands + fades
	const PULSE_DURATION  = 300;   // ms white flash pulse
	const BURST_MAX_SIZE  = SYMBOL_SIZE * 2.2;
	const STAGGER         = 80;    // ms between each scatter firing

	type ScatterDef = {
		x: number;
		y: number;
		delay: number;
	};

	// ── Reactive state ────────────────────────────────────────────────────────
	let scatterDefs = $state<ScatterDef[]>([]);
	let animTime    = $state(0);

	let rafAnim:   number | null = null;
	let animStart  = 0;
	let timers:    ReturnType<typeof setTimeout>[] = [];

	function stopAll() {
		if (rafAnim !== null) { cancelAnimationFrame(rafAnim); rafAnim = null; }
		timers.forEach(clearTimeout);
		timers = [];
		scatterDefs = [];
		animTime    = 0;
	}

	function startScatterAnim(positions: Position[]) {
		stopAll();
		if (positions.length === 0) return;

		scatterDefs = positions.map((p, i) => ({
			x: getSymbolX(p.reel),
			y: getSymbolY(p.row - 1),
			delay: i * STAGGER,
		}));

		animStart = performance.now();
		animTime  = 0;

		const totalDuration = BURST_DURATION + scatterDefs.length * STAGGER + 50;

		function tick(now: number) {
			animTime = now - animStart;
			if (animTime < totalDuration) {
				rafAnim = requestAnimationFrame(tick);
			} else {
				scatterDefs = [];
				rafAnim     = null;
			}
		}
		rafAnim = requestAnimationFrame(tick);
	}

	context.eventEmitter.subscribeOnMount({
		boardWithAnimateSymbols: ({ symbolPositions, animationType = 'win' }) => {
			if (animationType !== 'scatter') return;
			startScatterAnim(symbolPositions);
		},
	});

	function easeOut(t: number) { return 1 - (1 - t) * (1 - t); }
	function easeIn(t: number)  { return t * t; }
</script>

<BoardContainer>
{#each scatterDefs as s}
	{@const elapsed   = Math.max(0, animTime - s.delay)}
	{@const t         = Math.min(elapsed / BURST_DURATION, 1)}
	{@const pt        = Math.min(elapsed / PULSE_DURATION, 1)}

	{#if elapsed > 0}
		<!-- White pulse flash — fades quickly -->
		{@const pulseAlpha = (1 - easeIn(pt)) * 0.9}
		{@const pulseSize  = SYMBOL_SIZE * (0.8 + pt * 0.6)}
		{#if pulseAlpha > 0.01}
			<Sprite
				key="fx_glow.png"
				x={s.x}
				y={s.y}
				anchor={0.5}
				width={pulseSize}
				height={pulseSize}
				alpha={pulseAlpha}
				tint={0xffffff}
			/>
		{/if}

	{/if}
{/each}
</BoardContainer>
