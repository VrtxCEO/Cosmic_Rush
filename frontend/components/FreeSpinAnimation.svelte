<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';

	import { Container, Graphics, type Sizes } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_DIMENSIONS, BOARD_SIZES } from '../game/constants';

	type Props = {
		children: Snippet<[{ sizes: Sizes }]>;
	};

	const props: Props = $props();

	const context = getContext();

	const PANEL_WIDTH = BOARD_SIZES.width;
	const PANEL_HEIGHT = PANEL_WIDTH * 0.55;
	const PANEL_SIZES: Sizes = { width: PANEL_WIDTH, height: PANEL_HEIGHT };

	// Animated scale for entrance
	const panelScale = new Tween(0);

	onMount(() => {
		panelScale.set(1, { duration: 400 });
	});

	const drawPanel = (g: any) => {
		g.clear();
		// Outer glow
		g.roundRect(-PANEL_WIDTH / 2 - 6, -PANEL_HEIGHT / 2 - 6, PANEL_WIDTH + 12, PANEL_HEIGHT + 12, 18);
		g.fill({ color: 0x4488ff, alpha: 0.3 });
		// Main panel background
		g.roundRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 14);
		g.fill({ color: 0x0a0a2e, alpha: 0.92 });
		// Border
		g.roundRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 14);
		g.stroke({ width: 3, color: 0x6699ff, alpha: 0.8 });
		// Inner highlight line
		g.roundRect(-PANEL_WIDTH / 2 + 8, -PANEL_HEIGHT / 2 + 8, PANEL_WIDTH - 16, PANEL_HEIGHT - 16, 10);
		g.stroke({ width: 1, color: 0x4466aa, alpha: 0.4 });
	};
</script>

<MainContainer>
	<Container
		x={context.stateGameDerived.boardLayout().x}
		y={context.stateGameDerived.boardLayout().y}
		scale={panelScale.current}
	>
		<Graphics draw={drawPanel} />
		<Container y={PANEL_HEIGHT * 0.05}>
			{@render props.children({ sizes: PANEL_SIZES })}
		</Container>
	</Container>
</MainContainer>
