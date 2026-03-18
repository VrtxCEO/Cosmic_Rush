<script lang="ts">
	import { stateUi } from 'state-shared';
	import { BLACK } from 'constants-shared/colors';
	import { MainContainer } from 'components-layout';
	import { Container, Rectangle, Sprite } from 'pixi-svelte';

	import { LANDSCAPE_BASE_SIZE } from '../constants';
	import type { LayoutUiProps } from '../types';
	import { getContext } from '../context';

	const props: LayoutUiProps = $props();
	const context = getContext();

	// Same 1920x1080 design space. Arc rail RAIL_W=800 matching desktop.
	const RAIL_W    = 800;
	const RAIL_H    = RAIL_W * (1024 / 1536);
	const RAIL_X    = 960;
	const RAIL_Y    = 711;

	const pSpin     = { x: 960,  y: 763 };
	const pDecrease = { x: 836,  y: 787 };
	const pMenu     = { x: 688,  y: 760 };
	const pIncrease = { x: 1084, y: 791 };
	const pAutoSpin = { x: 1178, y: 786 };
	const pBetAmt   = { x: 643,  y: 754 };
	const pBalance  = { x: 1277, y: 754 };
	const pWin      = { x: 960,  y: 90 };
	const pTurbo    = { x: 771,  y: 776 };
	const pBuyBonus = { x: 1232, y: 710 };

	const BTN_SCALE = 0.48;
</script>

<MainContainer standard>
	<Sprite key="arc_rail.png" x={RAIL_X} y={RAIL_Y} width={RAIL_W} height={RAIL_H} anchor={0.5} />

	<Container x={pSpin.x} y={pSpin.y}>
		{@render props.buttonBet({ anchor: 0.5 })}
	</Container>
	<Container x={pDecrease.x} y={pDecrease.y} scale={BTN_SCALE}>
		{@render props.buttonDecrease({ anchor: 0.5 })}
	</Container>
	<Container x={pMenu.x} y={pMenu.y} scale={BTN_SCALE}>
		{@render props.buttonMenu({ anchor: 0.5 })}
	</Container>
	<Container x={pIncrease.x} y={pIncrease.y} scale={BTN_SCALE}>
		{@render props.buttonIncrease({ anchor: 0.5 })}
	</Container>
	<Container x={pAutoSpin.x} y={pAutoSpin.y} scale={BTN_SCALE}>
		{@render props.buttonAutoSpin({ anchor: 0.5 })}
	</Container>
	<Container x={pTurbo.x} y={pTurbo.y} scale={BTN_SCALE}>
		{@render props.buttonTurbo({ anchor: 0.5 })}
	</Container>
	<Container x={pBuyBonus.x} y={pBuyBonus.y} scale={BTN_SCALE}>
		{@render props.buttonBuyBonus({ anchor: 0.5 })}
	</Container>
	<Container x={pBetAmt.x} y={pBetAmt.y} scale={BTN_SCALE}>
		{@render props.amountBet({ stacked: true })}
	</Container>
	<Container x={pBalance.x} y={pBalance.y} scale={BTN_SCALE}>
		{@render props.amountBalance({ stacked: true })}
	</Container>
	<Container x={pWin.x} y={pWin.y} scale={BTN_SCALE}>
		{@render props.amountWin({ stacked: true })}
	</Container>
	<Container x={20} y={10}>
		{@render props.gameName()}
	</Container>
	<Container x={1900} y={10}>
		{@render props.logo()}
	</Container>
</MainContainer>

{#if stateUi.menuOpen}
	<Rectangle
		eventMode="static"
		cursor="pointer"
		alpha={0.5}
		anchor={0.5}
		backgroundColor={BLACK}
		width={context.stateLayoutDerived.canvasSizes().width}
		height={context.stateLayoutDerived.canvasSizes().height}
		x={context.stateLayoutDerived.canvasSizes().width * 0.5}
		y={context.stateLayoutDerived.canvasSizes().height * 0.5}
		onpointerup={() => (stateUi.menuOpen = false)}
	/>
	<MainContainer standard>
		<Container x={pMenu.x}>
			<Container y={pMenu.y - LANDSCAPE_BASE_SIZE * 3.5}>
				{@render props.buttonPayTable({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y - LANDSCAPE_BASE_SIZE * 2.2}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y - LANDSCAPE_BASE_SIZE * 0.9}>
				{@render props.buttonSettings({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y + LANDSCAPE_BASE_SIZE * 0.4}>
				{@render props.buttonSoundSwitch({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y + LANDSCAPE_BASE_SIZE * 1.7}>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}
