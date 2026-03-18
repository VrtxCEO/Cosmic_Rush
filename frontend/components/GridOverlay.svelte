<script lang="ts">
	import { Graphics } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	const draw = (g: any) => {
		const cols = context.stateGame.activeGridSize.reels;
		const rows = context.stateGame.activeGridSize.rows;
		const gridWidth = cols * SYMBOL_SIZE;
		const gridHeight = rows * SYMBOL_SIZE;

		g.clear();
		g.setStrokeStyle({ width: 1, color: 0xaa44ff, alpha: 0.05 });

		for (let i = 0; i <= cols; i++) {
			const x = i * SYMBOL_SIZE;
			g.moveTo(x, 0);
			g.lineTo(x, gridHeight);
		}

		for (let j = 0; j <= rows; j++) {
			const y = j * SYMBOL_SIZE;
			g.moveTo(0, y);
			g.lineTo(gridWidth, y);
		}

		g.stroke();
	};
</script>

{#key context.stateGame.activeGridSize.reels}
	<Graphics {draw} />
{/key}
