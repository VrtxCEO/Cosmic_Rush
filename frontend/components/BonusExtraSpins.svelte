<script lang="ts">
	import { Container, Graphics, BitmapText } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	let show = $state(false);
	let extraSpins = $state(0);

	const drawBg = (g: any) => {
		g.clear();
		g.roundRect(-180, -35, 360, 70, 14);
		g.fill({ color: 0x000000, alpha: 0.85 });
		g.roundRect(-180, -35, 360, 70, 14);
		g.stroke({ width: 3, color: 0x00ff88, alpha: 0.9 });
	};

	context.eventEmitter.subscribeOnMount({
		cosmicBreakFullUnlockAnimate: async (emitterEvent) => {
			extraSpins = emitterEvent.extraSpins;
			show = true;
			context.eventEmitter.broadcast({ type: 'soundExtraSpins' });
			await waitForTimeout(2000);
			show = false;
		},
	});
</script>

<MainContainer>
	<FadeContainer {show}>
		<Container
			x={context.stateGameDerived.boardLayout().x}
			y={context.stateGameDerived.boardLayout().y}
		>
			<Graphics draw={drawBg} />
			<BitmapText
				anchor={0.5}
				text={`+${extraSpins} SPINS!`}
				style={{
					fontFamily: 'purple',
					fontSize: SYMBOL_SIZE * 0.35,
				}}
			/>
		</Container>
	</FadeContainer>
</MainContainer>
