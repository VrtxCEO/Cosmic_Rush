<script lang="ts">
	import { Rectangle, Sprite } from 'pixi-svelte';

	import { getContext } from '../game/context';

	const context = getContext();

	const canvas = $derived(context.stateLayoutDerived.canvasSizes());
</script>

<!-- Black fill behind everything -->
<Rectangle {...context.stateLayoutDerived.canvasSizes()} backgroundColor={0x000000} zIndex={-3} />

<!-- Pixel art background -->
<Sprite
	key="background"
	x={canvas.width / 2}
	y={canvas.height / 2}
	width={canvas.width}
	height={canvas.height}
	anchor={0.5}
	zIndex={-2}
/>
