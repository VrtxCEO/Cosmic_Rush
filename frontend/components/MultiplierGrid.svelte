<script lang="ts" module>
	export type EmitterEventMultiplierGrid =
		| { type: 'multiplierGridShow' }
		| { type: 'multiplierGridHide' }
		| { type: 'multiplierGridUpdate'; grid: number[][] }
		| { type: 'multiplierGridClear' };
</script>

<script lang="ts">
	import { BitmapText, Container, Graphics, SpineProvider, SpineTrack } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();
	const hasAnticipationAsset = $derived(!!context.stateApp.loadedAssets?.anticipation);
	const DEFAULT_GRID = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
	];

	let show = $state(false);
	let grid = $state(DEFAULT_GRID);

	context.eventEmitter.subscribeOnMount({
		multiplierGridShow: () => (show = true),
		multiplierGridHide: () => (show = false),
		multiplierGridUpdate: (emitterEvent) => (grid = emitterEvent.grid),
		multiplierGridClear: () => (grid = DEFAULT_GRID),
	});

	const drawCell = (g: any) => {
		const size = SYMBOL_SIZE * 0.38;
		g.clear();
		g.roundRect(-size, -size, size * 2, size * 2, 6);
		g.stroke({ width: 2, color: 0x6b3fb6, alpha: 0.7 });
	};
</script>

<BoardContainer>
	{#if show}
		{#each grid as reel, reelIndex}
			{#each reel as multiplier, rowIndex}
				{#if multiplier > 0}
					<Container x={(reelIndex + 0.5) * SYMBOL_SIZE} y={(rowIndex + 0.5) * SYMBOL_SIZE}>
						{#if hasAnticipationAsset}
							<SpineProvider key="anticipation" width={SYMBOL_SIZE * 0.19}>
								<SpineTrack trackIndex={0} animationName={'payframe'} loop />
							</SpineProvider>
						{:else}
							<Graphics draw={drawCell} />
						{/if}
						{#if multiplier > 1}
							<BitmapText
								x={-SYMBOL_SIZE * 0.05}
								anchor={{
									x: 0.5,
									y: 0.5,
								}}
								text={`${multiplier} X`}
								style={{
									fontFamily: 'purple',
									fontSize: SYMBOL_SIZE * 0.5,
									letterSpacing: -5,
								}}
							/>
						{/if}
					</Container>
				{/if}
			{/each}
		{/each}
	{/if}
</BoardContainer>
