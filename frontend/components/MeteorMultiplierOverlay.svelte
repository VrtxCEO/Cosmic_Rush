<script lang="ts">
	import { BitmapText } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';
	import { stateBetDerived } from 'state-shared';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';

	const context = getContext();

	type MeteorLabel = {
		reel: number;
		row: number;
		multiplier: number;
		show: boolean;
		resolve: () => void;
	};

	let labels: MeteorLabel[] = $state([]);

	context.eventEmitter.subscribeOnMount({
		meteorLandAnimate: async (emitterEvent) => {
			const resolvers: (() => void)[] = [];

			labels = emitterEvent.meteors.map((m) => ({
				reel: m.reel,
				row: m.row,
				multiplier: m.multiplier,
				show: true,
				resolve: () => {},
			}));

			// Let the labels show briefly then fade
			await waitForTimeout(700 / stateBetDerived.timeScale());
			for (const label of labels) label.show = false;
			await waitForTimeout(300 / stateBetDerived.timeScale());
			labels = [];
		},
	});
</script>

<BoardContainer>
	{#each labels as label (label.reel + '_' + label.row)}
		<FadeContainer show={label.show} duration={200}>
			<BitmapText
				x={SYMBOL_SIZE * (label.reel + 0.5)}
				y={SYMBOL_SIZE * (label.row + 0.5)}
				anchor={0.5}
				text={`+${label.multiplier}×`}
				style={{
					fontFamily: 'purple',
					fontSize: SYMBOL_SIZE * 0.55,
				}}
			/>
		</FadeContainer>
	{/each}
</BoardContainer>
