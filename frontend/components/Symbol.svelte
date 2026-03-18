<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';

	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolInfo } from '../game/utils';
	import { getContext } from '../game/context';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');

	// Win frame disabled until payframe Spine asset is provided
	// const showWinFrame = $derived(
	// 	['win', 'postWinStatic', 'explosion'].includes(props.state) &&
	// 		!['SUN'].includes(props.rawSymbol.name),
	// );
</script>

{#if isSprite}
	<SymbolSprite {symbolInfo} state={props.state} x={props.x} y={props.y} oncomplete={props.oncomplete} />
{:else}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		x={props.x}
		y={props.y}
		listener={{
			complete: props.oncomplete,
			event: (_, event) => {},
		}}
	/>
{/if}

<!-- Uncomment when payframe Spine asset is provided:
{#if showWinFrame}
	<SpineProvider x={props.x} y={props.y} key="anticipation" width={SYMBOL_SIZE * 0.19}>
		<SpineTrack trackIndex={0} animationName={'payframe'} loop />
	</SpineProvider>
{/if}
-->
