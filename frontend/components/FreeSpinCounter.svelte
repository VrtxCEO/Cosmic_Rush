<script lang="ts" module>
	export type EmitterEventFreeSpinCounter =
		| { type: 'freeSpinCounterShow' }
		| { type: 'freeSpinCounterHide' }
		| { type: 'freeSpinCounterUpdate'; current?: number; total?: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { BitmapText, Sprite } from 'pixi-svelte';

	const context = getContext();
	const PANEL_KEY = 'Reel_House.png';
	const PANEL_RATIO = 1024 / 1024;
	const panelWidth = $derived(SYMBOL_SIZE * 2);
	const panelSizes = $derived({
		width: panelWidth,
		height: panelWidth / PANEL_RATIO,
	});
	const position = $derived({
		x:
			context.stateGameDerived.boardLayout().x -
			context.stateGameDerived.boardLayout().width * 0.5,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.5 -
			panelSizes.height - SYMBOL_SIZE * 0.15,
	});

	const labelSize = $derived(SYMBOL_SIZE * 0.18);
	const numSize = $derived(SYMBOL_SIZE * 0.4);

	let show = $state(false);
	let current = $state(0);
	let total = $state(0);

	context.eventEmitter.subscribeOnMount({
		freeSpinCounterShow: () => (show = true),
		freeSpinCounterHide: () => (show = false),
		freeSpinCounterUpdate: (emitterEvent) => {
			if (emitterEvent.current !== undefined) current = emitterEvent.current;
			if (emitterEvent.total !== undefined) total = emitterEvent.total;
		},
	});
</script>

<MainContainer>
	<FadeContainer {show} {...position}>
		<Sprite key={PANEL_KEY} {...panelSizes} />
		<BitmapText
			text={'FREE SPINS'}
			x={panelSizes.width * 0.5}
			y={panelSizes.height * 0.15}
			anchor={{ x: 0.5, y: 0 }}
			style={{ fontFamily: 'purple', fontSize: labelSize, wordWrap: false }}
		/>
		<BitmapText
			text={`${current}/${total}`}
			x={panelSizes.width * 0.5}
			y={panelSizes.height * 0.55}
			anchor={{ x: 0.5, y: 0.5 }}
			style={{ fontFamily: 'neon', fontSize: numSize }}
		/>
	</FadeContainer>
</MainContainer>
