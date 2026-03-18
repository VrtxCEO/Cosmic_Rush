<script lang="ts" module>
	export type EmitterEventGlobalMultiplier =
		| { type: 'globalMultiplierShow' }
		| { type: 'globalMultiplierHide' }
		| { type: 'globalMultiplierUpdate'; multiplier: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { BitmapText, Sprite } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

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
			context.stateGameDerived.boardLayout().x +
			context.stateGameDerived.boardLayout().width * 0.5 -
			panelSizes.width,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.5 -
			panelSizes.height - SYMBOL_SIZE * 0.15,
	});

	const labelSize = $derived(SYMBOL_SIZE * 0.18);
	const numSize = $derived(SYMBOL_SIZE * 0.4);

	let show = $state(false);
	let multiplier = $state(1);

	context.eventEmitter.subscribeOnMount({
		globalMultiplierShow: () => (show = true),
		globalMultiplierHide: () => (show = false),
		globalMultiplierUpdate: (emitterEvent) => {
			multiplier = emitterEvent.multiplier;
		},
	});
</script>

<MainContainer>
	<FadeContainer {show} {...position}>
		<Sprite key={PANEL_KEY} {...panelSizes} />
		<BitmapText
			text={'MULTI'}
			x={panelSizes.width * 0.5}
			y={panelSizes.height * 0.15}
			anchor={{ x: 0.5, y: 0 }}
			style={{ fontFamily: 'purple', fontSize: labelSize, wordWrap: false }}
		/>
		<BitmapText
			text={`${multiplier}x`}
			x={panelSizes.width * 0.5}
			y={panelSizes.height * 0.55}
			anchor={{ x: 0.5, y: 0.5 }}
			style={{ fontFamily: 'neon', fontSize: numSize }}
		/>
	</FadeContainer>
</MainContainer>
