<script lang="ts">
	import { stateUi } from 'state-shared';
	import { BLACK } from 'constants-shared/colors';
	import { MainContainer } from 'components-layout';
	import { Container, Rectangle, Sprite } from 'pixi-svelte';

	import { DESKTOP_BASE_SIZE } from '../constants';
	import { getContext } from '../context';
	import type { LayoutUiProps } from '../types';

	const props: LayoutUiProps = $props();
	const context = getContext();

	// Canvas: 1920×1080. Arc rail image: 1536×1024.
	// Rail is scaled to 1380px wide, anchored at (0.5, 0.6).
	const RAIL_W   = 1380;
	const RAIL_H   = RAIL_W * (1024 / 1536); // ≈ 920
	const RAIL_X   = 960;
	const RAIL_Y   = 1080; // flush with bottom — top portion of image is transparent

	// Socket positions measured as fractions of image (1536×1024), then scaled.
	// Center socket (large — spin):        image ~(768, 430) → offset (  0, -0.18H)
	// Left-inner socket (−):               image ~(620, 460) → offset (-148/1536 * W, ...)
	// Left-outer socket (menu):            image ~(460, 475) → offset
	// Right-inner socket (+):              image ~(916, 460)
	// Right-outer socket (auto):           image ~(1076, 475)
	const s = RAIL_W / 1536; // pixel scale factor

	const CENTER_Y_OFFSET  = -0.40 * RAIL_H; // center socket sits upper-center of image

	const pSpin      = { x: RAIL_X,             y: RAIL_Y + CENTER_Y_OFFSET };
	const pDecrease  = { x: RAIL_X - 148 * s,   y: RAIL_Y + CENTER_Y_OFFSET + 26 * s };
	const pMenu      = { x: RAIL_X - 308 * s,   y: RAIL_Y + CENTER_Y_OFFSET + 38 * s };
	const pIncrease  = { x: RAIL_X + 148 * s,   y: RAIL_Y + CENTER_Y_OFFSET + 26 * s };
	const pAutoSpin  = { x: RAIL_X + 308 * s,   y: RAIL_Y + CENTER_Y_OFFSET + 38 * s };

	// Wing-tip stats — sit above each wing end
	const pBetAmt    = { x: RAIL_X - 530 * s,   y: RAIL_Y + CENTER_Y_OFFSET - 10 * s };
	const pBalance   = { x: RAIL_X + 530 * s,   y: RAIL_Y + CENTER_Y_OFFSET - 10 * s };

	// Win floats top-center above the belt
	const pWin       = { x: RAIL_X,             y: 90 };

	// Turbo + BuyBonus float just above left/right of rail
	const pTurbo     = { x: RAIL_X - 440 * s,   y: RAIL_Y + CENTER_Y_OFFSET - 90 * s };
	const pBuyBonus  = { x: RAIL_X + 440 * s,   y: RAIL_Y + CENTER_Y_OFFSET - 90 * s };

	const BTN_SCALE = 0.82;
</script>

<MainContainer standard>
	<!-- ── Arc rail background ──────────────────────────────────────────── -->
	<Sprite
		key="arc_rail.png"
		x={RAIL_X}
		y={RAIL_Y}
		width={RAIL_W}
		height={RAIL_H}
		anchor={0.5}
	/>

	<!-- ── Spin (center socket) ─────────────────────────────────────────── -->
	<Container x={pSpin.x} y={pSpin.y}>
		{@render props.buttonBet({ anchor: 0.5 })}
	</Container>

	<!-- ── Action buttons (sockets) ─────────────────────────────────────── -->
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

	<!-- ── Floating: turbo + buy bonus ──────────────────────────────────── -->
	<Container x={pTurbo.x} y={pTurbo.y} scale={BTN_SCALE}>
		{@render props.buttonTurbo({ anchor: 0.5 })}
	</Container>

	<Container x={pBuyBonus.x} y={pBuyBonus.y} scale={BTN_SCALE}>
		{@render props.buttonBuyBonus({ anchor: 0.5 })}
	</Container>

	<!-- ── Stat labels ───────────────────────────────────────────────────── -->
	<Container x={pBetAmt.x} y={pBetAmt.y} scale={BTN_SCALE}>
		{@render props.amountBet({ stacked: true })}
	</Container>

	<Container x={pBalance.x} y={pBalance.y} scale={BTN_SCALE}>
		{@render props.amountBalance({ stacked: true })}
	</Container>

	<Container x={pWin.x} y={pWin.y} scale={BTN_SCALE}>
		{@render props.amountWin({ stacked: true })}
	</Container>

	<!-- ── Game name / logo ──────────────────────────────────────────────── -->
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
			<Container y={pMenu.y - DESKTOP_BASE_SIZE * 3.5}>
				{@render props.buttonPayTable({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y - DESKTOP_BASE_SIZE * 2.2}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y - DESKTOP_BASE_SIZE * 0.9}>
				{@render props.buttonSettings({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y + DESKTOP_BASE_SIZE * 0.4}>
				{@render props.buttonSoundSwitch({ anchor: 0.5 })}
			</Container>
			<Container y={pMenu.y + DESKTOP_BASE_SIZE * 1.7}>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}
