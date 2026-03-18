<script lang="ts">
	import { stateBet } from 'state-shared';
	import { stateGame, stateGameDerived, resizeBoard, type BonusType } from '../game/stateGame.svelte';
	import { eventEmitter } from '../game/eventEmitter';
	import { SYMBOL_SIZE, BOARD_DIMENSIONS } from '../game/constants';
	import type { RawSymbol } from '../game/types';

	let open = $state(true);

	const SYMBOLS: RawSymbol['name'][] = ['PLU', 'MER', 'VEN', 'EAR', 'MAR', 'JUP', 'SAT', 'URA', 'NEP'];

	const randomSymbol = (): RawSymbol => {
		const name = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
		return { name };
	};

	const randomBoard = (reels: number, rows: number): RawSymbol[][] => {
		const entriesPerReel = rows + 2;
		return Array.from({ length: reels }, () =>
			Array.from({ length: entriesPerReel }, () => randomSymbol()),
		);
	};

	const settleRandom = (reels: number, rows: number) => {
		const board = randomBoard(reels, rows);
		stateGameDerived.enhancedBoard.settle(board);
	};

	// ─── Reset everything back to base game ────────────────────
	const handleResetBase = () => {
		// Hide all bonus UI
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		eventEmitter.broadcast({ type: 'multiplierGridHide' });

		// Reset state
		stateGame.bonusType = null;
		stateGame.gameType = 'basegame';
		stateGame.cosmicBreakCorners = [];
		stateGame.cosmicBreakMultiplier = 1;

		// Resize to 5x5
		resizeBoard(BOARD_DIMENSIONS.x, BOARD_DIMENSIONS.y);
		settleRandom(BOARD_DIMENSIONS.x, BOARD_DIMENSIONS.y);
	};

	// ─── Start Cosmic Break (8x8) ────────────────────────────
	const handleStartCosmicBreak = () => {
		handleResetBase();

		stateGame.bonusType = 'cosmicBreak';
		stateGame.gameType = 'freegame';
		stateGame.cosmicBreakMultiplier = 1;

		// Resize to 8x8 and settle
		resizeBoard(8, 8);
		settleRandom(8, 8);

		// Show bonus UI
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		eventEmitter.broadcast({ type: 'globalMultiplierUpdate', multiplier: 1 });
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({ type: 'freeSpinCounterUpdate', current: 1, total: 10 });
	};

	// ─── Board helpers ────────────────────────────────────────
	const handleSettleRandom = () => {
		const { reels, rows } = stateGame.activeGridSize;
		settleRandom(reels, rows);
	};

	const handleSettleWithScatters = () => {
		const { reels, rows } = stateGame.activeGridSize;
		const board = randomBoard(reels, rows);
		const scatterCount = Math.min(reels, 5);
		for (let i = 0; i < scatterCount; i++) {
			board[i][1 + Math.floor(Math.random() * rows)] = { name: 'SUN' };
		}
		stateGameDerived.enhancedBoard.settle(board);
	};

	const handleSettleWithMeteors = () => {
		const { reels, rows } = stateGame.activeGridSize;
		const board = randomBoard(reels, rows);
		const meteorCount = Math.min(reels, 4);
		for (let i = 0; i < meteorCount; i++) {
			board[i + 1][1 + Math.floor(Math.random() * rows)] = { name: 'MET' };
		}
		stateGameDerived.enhancedBoard.settle(board);
	};

	// ─── Balance top-up ──────────────────────────────────────
	const handleTopUp = async () => {
		const amount = 100_000 * 1_000_000; // $100,000 in API units
		const res = await fetch('/wallet/top-up', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount }),
		});
		if (res.ok) {
			const data = await res.json();
			if (data?.balance?.amount !== undefined) {
				stateBet.balanceAmount = data.balance.amount / 1_000_000;
				return;
			}
		}
		// Fallback if response is unexpected
		stateBet.balanceAmount += 100_000;
	};

	const gridLabel = $derived(
		`${stateGame.activeGridSize.reels}x${stateGame.activeGridSize.rows}`,
	);
	const scaleLabel = $derived(
		stateGameDerived.boardScale().toFixed(3),
	);
</script>

<button class="dev-toggle" on:click={() => (open = !open)}>
	{open ? 'X' : 'DEV'}
</button>

{#if open}
	<div class="dev-panel">
		<div class="dev-title">Dev Panel</div>

		<div class="dev-section">
			<div class="dev-label">State</div>
			<div class="dev-info">
				<span>Grid: <strong>{gridLabel}</strong></span>
				<span>Scale: <strong>{scaleLabel}</strong></span>
				<span>Bonus: <strong>{stateGame.bonusType ?? 'none'}</strong></span>
				<span>Game: <strong>{stateGame.gameType}</strong></span>
				<span>Reels: <strong>{stateGame.board.length}</strong></span>
			</div>
		</div>

		<div class="dev-section">
			<div class="dev-label">Start Bonus</div>
			<div class="dev-buttons">
				<button on:click={handleStartCosmicBreak}>Cosmic Break 8x8</button>
			</div>
		</div>

		<div class="dev-section">
			<div class="dev-label">Board</div>
			<div class="dev-buttons">
				<button on:click={handleSettleRandom}>Random</button>
				<button on:click={handleSettleWithScatters}>+ Scatters</button>
				<button on:click={handleSettleWithMeteors}>+ Meteors</button>
			</div>
		</div>

		<div class="dev-section">
			<div class="dev-label">Balance</div>
			<div class="dev-buttons">
				<button class="dev-topup" on:click={handleTopUp}>+$100k</button>
			</div>
		</div>

		<div class="dev-section">
			<div class="dev-buttons">
				<button class="dev-reset" on:click={handleResetBase}>Reset to Base 5x5</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dev-toggle {
		position: fixed;
		top: 8px;
		right: 8px;
		z-index: 99999;
		background: #1a1a2e;
		color: #0ff;
		border: 1px solid #0ff;
		border-radius: 4px;
		padding: 4px 10px;
		font-family: monospace;
		font-size: 12px;
		cursor: pointer;
		user-select: none;
		appearance: none;
	}
	.dev-toggle:hover {
		background: #0ff;
		color: #1a1a2e;
	}

	.dev-panel {
		position: fixed;
		top: 36px;
		right: 8px;
		z-index: 99998;
		background: rgba(10, 10, 30, 0.92);
		border: 1px solid #0ff;
		border-radius: 6px;
		padding: 10px;
		font-family: monospace;
		font-size: 11px;
		color: #ccc;
		width: 220px;
		backdrop-filter: blur(6px);
	}

	.dev-title {
		color: #0ff;
		font-size: 13px;
		font-weight: bold;
		margin-bottom: 8px;
		border-bottom: 1px solid #333;
		padding-bottom: 4px;
	}

	.dev-section {
		margin-bottom: 8px;
	}

	.dev-label {
		color: #888;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 4px;
	}

	.dev-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.dev-info strong {
		color: #0ff;
	}

	.dev-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.dev-buttons button {
		background: #1a1a2e;
		color: #ddd;
		border: 1px solid #444;
		border-radius: 3px;
		padding: 3px 8px;
		font-family: monospace;
		font-size: 10px;
		cursor: pointer;
		transition: all 0.1s;
	}
	.dev-buttons button:hover {
		background: #0ff;
		color: #1a1a2e;
		border-color: #0ff;
	}
	.dev-buttons button:active {
		transform: scale(0.95);
	}
	.dev-topup {
		border-color: #0f0 !important;
		color: #0f0 !important;
		width: 100%;
	}
	.dev-topup:hover {
		background: #0f0 !important;
		color: #1a1a2e !important;
		border-color: #0f0 !important;
	}
	.dev-reset {
		border-color: #f55 !important;
		color: #f88 !important;
		width: 100%;
	}
	.dev-reset:hover {
		background: #f55 !important;
		color: #1a1a2e !important;
		border-color: #f55 !important;
	}
</style>
