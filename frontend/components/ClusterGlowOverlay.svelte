<script lang="ts">
	import type * as PIXI from 'pixi.js';
	import { Ticker } from 'pixi.js';
	import { Graphics } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import BoardContainer from './BoardContainer.svelte';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import type { Position } from '../game/types';

	const context = getContext();

	// ── Constants ─────────────────────────────────────────────────────────────
	const CHAIN_STEP_MS  = 65;
	const FLASH_DURATION = 200;
	const BOLT_FADE_MS   = 280;
	const TOTAL_CHAIN_BUDGET = 8 * CHAIN_STEP_MS;

	// ── Types ─────────────────────────────────────────────────────────────────
	type Node = { x: number; y: number };
	type ChainInstance = {
		chain:    Node[];
		elapsed:  number;
		hitTimes: number[];
		done:     boolean;
	};

	// ── Reactive state ────────────────────────────────────────────────────────
	let frame     = $state(0);
	let instances = $state<ChainInstance[]>([]);

	// ── Single shared ticker ──────────────────────────────────────────────────
	let tickFn: ((t: Ticker) => void) | null = null;

	function ensureTicker() {
		if (tickFn) return;
		tickFn = (t: Ticker) => {
			frame++;
			for (const inst of instances) {
				if (inst.done) continue;
				inst.elapsed += t.deltaMS;
				for (let i = 1; i < inst.chain.length; i++) {
					if (inst.hitTimes[i] < 0 && inst.elapsed >= i * CHAIN_STEP_MS) {
						inst.hitTimes[i] = inst.elapsed;
					}
				}
				if (inst.elapsed > TOTAL_CHAIN_BUDGET + BOLT_FADE_MS + 100) {
					inst.done = true;
				}
			}
			// Prune completed instances
			if (instances.every(i => i.done)) {
				instances = [];
				Ticker.shared.remove(tickFn!);
				tickFn = null;
			}
		};
		Ticker.shared.add(tickFn);
	}

	// ── Nearest-neighbour sort ────────────────────────────────────────────────
	function buildChain(positions: Position[]): Node[] {
		if (positions.length === 0) return [];
		type P = Node & { used: boolean };
		const pts: P[] = positions.map(p => ({
			x: getSymbolX(p.reel),
			y: getSymbolY(p.row - 1),
			used: false,
		}));
		const result: Node[] = [];
		let cur = pts[0];
		cur.used = true;
		result.push({ x: cur.x, y: cur.y });
		while (result.length < pts.length) {
			let best = pts.find(p => !p.used)!;
			let minD = (best.x - cur.x) ** 2 + (best.y - cur.y) ** 2;
			for (const p of pts) {
				if (p.used) continue;
				const d = (p.x - cur.x) ** 2 + (p.y - cur.y) ** 2;
				if (d < minD) { minD = d; best = p; }
			}
			best.used = true;
			result.push({ x: best.x, y: best.y });
			cur = best;
		}
		return result;
	}

	function addChain(positions: Position[]) {
		if (positions.length === 0) return;
		const chain = buildChain(positions);
		instances = [...instances, {
			chain,
			elapsed:  0,
			hitTimes: chain.map((_, i) => i === 0 ? 0 : -1),
			done:     false,
		}];
		ensureTicker();
	}

	context.eventEmitter.subscribeOnMount({
		boardWithAnimateSymbols: ({ symbolPositions, clusters, animationType = 'win' }) => {
			if (animationType === 'scatter') return;
			if (clusters && clusters.length > 0) {
				for (const cluster of clusters) addChain(cluster);
			} else if (symbolPositions.length > 0) {
				addChain(symbolPositions);
			}
		},
	});

	// ── Lightning draw helpers ────────────────────────────────────────────────
	function drawBolt(
		g: PIXI.Graphics,
		x1: number, y1: number,
		x2: number, y2: number,
		alpha: number,
	) {
		const SEGS   = 8;
		const JITTER = 16;
		const pts: [number, number][] = [[x1, y1]];
		for (let i = 1; i < SEGS; i++) {
			const t = i / SEGS;
			pts.push([
				x1 + (x2 - x1) * t + (Math.random() - 0.5) * JITTER * 2,
				y1 + (y2 - y1) * t + (Math.random() - 0.5) * JITTER * 2,
			]);
		}
		pts.push([x2, y2]);

		const layers: [number, number, number][] = [
			[22, 0x6600cc, 0.25],
			[10, 0xaa44ff, 0.70],
			[4,  0xdd99ff, 0.90],
			[1.5, 0xffffff, 1.00],
		];
		for (const [width, color, a] of layers) {
			g.setStrokeStyle({ width, color, alpha: a * alpha });
			g.moveTo(pts[0][0], pts[0][1]);
			for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
			g.stroke();
		}
	}

	// ── Main draw (re-derived every frame) ───────────────────────────────────
	const drawScene = $derived.by(() => {
		const _frame     = frame;
		const _instances = instances;

		return (g: PIXI.Graphics) => {
			g.clear();

			for (const inst of _instances) {
				if (inst.done) continue;
				const { chain, elapsed, hitTimes } = inst;

				// Bolt segments
				for (let i = 0; i < chain.length - 1; i++) {
					const { x: x1, y: y1 } = chain[i];
					const { x: x2, y: y2 } = chain[i + 1];

					if (hitTimes[i + 1] >= 0) {
						const age   = elapsed - hitTimes[i + 1];
						const alpha = Math.max(0, 1 - age / BOLT_FADE_MS);
						if (alpha > 0.02) drawBolt(g, x1, y1, x2, y2, alpha);
					} else if (hitTimes[i] >= 0) {
						const t  = Math.min((elapsed - hitTimes[i]) / CHAIN_STEP_MS, 1);
						const ex = x1 + (x2 - x1) * t;
						const ey = y1 + (y2 - y1) * t;
						drawBolt(g, x1, y1, ex, ey, 1.0);
					}
				}

				// Hit flashes
				for (let i = 0; i < chain.length; i++) {
					if (hitTimes[i] < 0) continue;
					const age   = elapsed - hitTimes[i];
					const t     = Math.min(age / FLASH_DURATION, 1);
					const alpha = 1 - t;
					const r     = SYMBOL_SIZE * 0.55 * (0.4 + t * 0.6);
					if (alpha > 0.02) {
						const { x, y } = chain[i];
						g.circle(x, y, r);
						g.fill({ color: 0xcc88ff, alpha: alpha * 0.55 });
						g.circle(x, y, r * 0.4);
						g.fill({ color: 0xffffff, alpha: alpha * 0.9 });
					}
				}
			}
		};
	});
</script>

{#if instances.length > 0}
<BoardContainer>
	<Graphics draw={drawScene} />
</BoardContainer>
{/if}
