<script lang="ts">
	import { Rectangle } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	type Props = { debug?: boolean };

	const props: Props = $props();
	const context = getContext();
</script>

{#if props.debug}
	<Rectangle
		alpha={0.5}
		backgroundColor={0xffffff}
		width={context.stateGameDerived.boardLocalSize().width}
		height={context.stateGameDerived.boardLocalSize().height}
	/>
{/if}

<Rectangle
	isMask
	x={-SYMBOL_SIZE}
	width={context.stateGameDerived.boardLocalSize().width + SYMBOL_SIZE * 2}
	height={context.stateGameDerived.boardLocalSize().height}
/>
