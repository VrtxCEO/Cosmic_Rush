<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { Graphics, Container } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { getContext } from '../game/context';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	const scale = new Tween(0);

	onMount(async () => {
		// Scale in from center — covers the screen
		await scale.set(1, { duration: 350 });
		// Scene is now covered — signal the caller to swap content
		props.oncomplete();
		// Scale back out to reveal new scene
		await scale.set(0, { duration: 350 });
	});

	const drawOverlay = (g: any) => {
		const { width, height } = context.stateLayoutDerived.canvasSizes();
		const d = Math.sqrt(width * width + height * height) * 1.1;
		g.clear();
		g.circle(0, 0, d / 2);
		g.fill({ color: 0x000000 });
	};
</script>

<MainContainer>
	<Container
		x={context.stateLayoutDerived.canvasSizes().width * 0.5}
		y={context.stateLayoutDerived.canvasSizes().height * 0.5}
		scale={scale.current}
		zIndex={200}
	>
		<Graphics draw={drawOverlay} />
	</Container>
</MainContainer>
