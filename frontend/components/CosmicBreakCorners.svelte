<script lang="ts">
	import { Container, Sprite, BitmapText } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';
	import { Ticker } from 'pixi.js';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import type { CornerState } from '../game/typesBookEvent';

	const context = getContext();

	// Local (pre-scale) coordinates — same space as BoardContainer children.
	// Each cell = SYMBOL_SIZE. 8x8 grid. 3x3 locked blocks per corner.
	const BLOCK_CELLS = 3;
	const GRID_CELLS = 8;
	const BLOCK_SIZE = BLOCK_CELLS * SYMBOL_SIZE; // 300 local px
	const GRID_SIZE = GRID_CELLS * SYMBOL_SIZE;   // 800 local px

	// Corner top-left positions in local board space (0,0 = board top-left)
	const cornerPositions: Record<string, { x: number; y: number }> = {
		topLeft:     { x: 0,                    y: 0 },
		topRight:    { x: GRID_SIZE - BLOCK_SIZE, y: 0 },
		bottomLeft:  { x: 0,                    y: GRID_SIZE - BLOCK_SIZE },
		bottomRight: { x: GRID_SIZE - BLOCK_SIZE, y: GRID_SIZE - BLOCK_SIZE },
	};

	let show = $state(false);
	let corners: CornerState[] = $state([]);

	// Displayed hit counts — driven by count-up animation, not raw event data
	let displayedHits: Record<string, number> = $state({});

	let flyOffsets: Record<string, { x: number; y: number; rotation: number; alpha: number }> =
		$state({});
	let hiddenCorners: Set<string> = $state(new Set());

	function animateDigitalDissolve(cornerId: string): Promise<void> {
		return new Promise((resolve) => {
			const duration = 650;
			const baseInterval = 45;
			let elapsed = 0;
			let flickerTimer = 0;
			let flickerOn = true;
			const ticker = Ticker.shared;

			flyOffsets[cornerId] = { x: 0, y: 0, rotation: 0, alpha: 1 };

			const update = () => {
				elapsed += ticker.deltaMS;
				flickerTimer += ticker.deltaMS;
				const t = Math.min(elapsed / duration, 1);

				// Flicker interval shrinks as t increases (gets more frantic)
				const interval = baseInterval * (1 - t * 0.65);
				if (flickerTimer >= interval) {
					flickerTimer = 0;
					flickerOn = !flickerOn;
				}

				// Small random jitter
				const jitter = t < 0.85 ? (Math.random() - 0.5) * 5 : 0;

				// Final fade in last 20%
				const fade = t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1;

				flyOffsets[cornerId] = {
					x: jitter,
					y: jitter * 0.6,
					rotation: 0,
					alpha: (flickerOn ? 1 : 0.05) * fade,
				};

				if (t >= 1) {
					ticker.remove(update);
					hiddenCorners = new Set([...hiddenCorners, cornerId]);
					resolve();
				}
			};
			ticker.add(update);
		});
	}

	async function animateCountDown(cornerId: string): Promise<void> {
		const from = displayedHits[cornerId] ?? 0;
		for (let i = from - 1; i >= 0; i--) {
			displayedHits[cornerId] = i;
			await waitForTimeout(180);
		}
	}

	context.eventEmitter.subscribeOnMount({
		cosmicBreakCornersShow: () => (show = true),
		cosmicBreakCornersHide: () => {
			show = false;
			corners = [];
			flyOffsets = {};
			hiddenCorners = new Set();
			displayedHits = {};
		},
		cosmicBreakCornersInit: (emitterEvent) => {
			corners = emitterEvent.corners;
			flyOffsets = {};
			hiddenCorners = new Set();
			displayedHits = Object.fromEntries(
				emitterEvent.corners.map((c) => [c.id, c.hitsRequired - c.hitsReceived]),
			);
		},
		cosmicBreakCornersUpdate: async (emitterEvent) => {
			const unlocked: string[] = emitterEvent.newlyUnlocked;

			if (unlocked.length > 0) {
				for (const id of unlocked) {
					const newData = emitterEvent.corners.find((c) => c.id === id);
					if (!newData) continue;
					// Count down to 0 then fly off
					corners = corners.map((c) => (c.id === id ? { ...c, unlocked: true } : c));
					await animateDigitalDissolve(id);
				}
				// Apply full update for any remaining corners
				corners = emitterEvent.corners;
			} else {
				corners = emitterEvent.corners;
				for (const corner of emitterEvent.corners) {
					displayedHits[corner.id] = corner.hitsRequired - corner.hitsReceived;
				}
			}
		},
		cosmicBreakFullUnlockAnimate: async () => {
			await waitForTimeout(100);
		},
	});
</script>

<FadeContainer {show}>
	<MainContainer>
		<!-- Match BoardContainer transform so corners align with board cells -->
		<Container
			x={context.stateGameDerived.boardLayout().x}
			y={context.stateGameDerived.boardLayout().y - 15}
			pivot={context.stateGameDerived.boardLayout().pivot}
			scale={context.stateGameDerived.boardScale()}
		>
			{#each corners as corner}
				{@const pos = cornerPositions[corner.id]}
				{@const offset = flyOffsets[corner.id]}
				{#if pos && !hiddenCorners.has(corner.id)}
					<Container
						x={pos.x + (offset?.x ?? 0)}
						y={pos.y + (offset?.y ?? 0)}
						rotation={offset?.rotation ?? 0}
						alpha={offset?.alpha ?? 1}
					>
						{#if !corner.unlocked || offset}
							<Sprite
								key={'LockZone.png'}
								anchor={0.5}
								x={BLOCK_SIZE / 2}
								y={BLOCK_SIZE / 2}
								width={375}
								height={375}
							/>
							<Container x={BLOCK_SIZE / 2} y={BLOCK_SIZE / 2}>
								<BitmapText
									anchor={0.5}
									text={`${displayedHits[corner.id] ?? corner.hitsRequired}`}
									style={{
										fontFamily: 'purple',
										fontSize: SYMBOL_SIZE * 1.0,
									}}
								/>
							</Container>
						{/if}
					</Container>
				{/if}
			{/each}
		</Container>
	</MainContainer>
</FadeContainer>
