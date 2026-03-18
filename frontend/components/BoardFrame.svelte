<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Ticker } from 'pixi.js';
	import { Sprite } from 'pixi-svelte';

	import { getContext } from '../game/context';

	const context = getContext();
	const SPRITE_SCALE = { width: 1.25, height: 1.55 };
	const BG_RATIO = 937 / 806;
	const POSITION_ADJUSTMENT = 1.01;

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {},
		boardFrameGlowHide: () => {},
	});

	const reelHouseBoard = $derived(context.stateGameDerived.boardLayout());

	// Box-Muller Gaussian sample
	function gauss(mean: number, sigma: number) {
		const u = 1 - Math.random();
		const v = Math.random();
		return mean + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}

	// Weighted type pool — mostly small rocks, fewer large
	const TYPE_POOL = [
		{ key: 'asteroid_small_1.png', size: 18 },
		{ key: 'asteroid_small_1.png', size: 18 },
		{ key: 'asteroid_small_1.png', size: 18 },
		{ key: 'asteroid_small_2.png', size: 16 },
		{ key: 'asteroid_small_2.png', size: 16 },
		{ key: 'asteroid_small_2.png', size: 16 },
		{ key: 'asteroid_med_2.png', size: 28 },
		{ key: 'asteroid_med_2.png', size: 28 },
		{ key: 'asteroid_large_2.png', size: 40 },
	];

	const ROCK_COUNT = 220;

	// Pre-compute all rock params once — only elapsed needs to update per frame
	const rocks = Array.from({ length: ROCK_COUNT }, (_, i) => {
		const def = TYPE_POOL[Math.floor(Math.random() * TYPE_POOL.length)];
		// Spread rocks in a Gaussian belt (sigma ~8% of radius)
		const radiusScale = gauss(1.0, 0.08);
		return {
			key: def.key,
			size: def.size,
			baseAngle: (i / ROCK_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
			speed: 0.000125 + (Math.random() - 0.5) * 0.00004,
			spin: (Math.random() - 0.5) * 0.002,
			baseRot: Math.random() * Math.PI * 2,
			// Per-rock ellipse radius multiplier for belt spread
			radiusScale: Math.max(0.75, Math.min(1.25, radiusScale)),
		};
	});

	// Single state: only one reactive update per frame
	let elapsed = $state(0);

	onMount(() => {
		const ticker = Ticker.shared;
		const update = () => {
			elapsed += ticker.deltaMS;
		};
		ticker.add(update);
		return () => ticker.remove(update);
	});
</script>

<Sprite
	key={"Reel_House.png"}
	anchor={0.5}
	x={reelHouseBoard.x}
	y={reelHouseBoard.y}
	width={reelHouseBoard.width * 1.45}
	height={reelHouseBoard.height * 1.45}
	zIndex={11}
/>

{#each rocks as rock}
	{@const board = context.stateGameDerived.boardLayout()}
	{@const cx = board.x * POSITION_ADJUSTMENT}
	{@const cy = board.y * POSITION_ADJUSTMENT}
	{@const rxBase = ((board.width * BG_RATIO * SPRITE_SCALE.width) / 2) * 0.98}
	{@const ryBase = ((board.width * SPRITE_SCALE.height) / 2) * 0.92}
	{@const rx = rxBase * rock.radiusScale}
	{@const ry = ryBase * rock.radiusScale}
	{@const a = rock.baseAngle + rock.speed * elapsed}
	{@const x = cx + Math.cos(a) * rx}
	{@const y = cy + Math.sin(a) * ry}
	{@const depthT = (Math.sin(a) + 1) / 2}
	{@const s = rock.size * (0.6 + depthT * 0.55)}
	<Sprite
		key={rock.key}
		anchor={0.5}
		{x}
		{y}
		width={s}
		height={s}
		rotation={rock.baseRot + rock.spin * elapsed}
		zIndex={Math.round(depthT * 10)}
	/>
{/each}

