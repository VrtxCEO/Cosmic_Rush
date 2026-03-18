<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';

	export type EmitterEventBoard =
		| { type: 'boardSettle'; board: RawSymbol[][] }
		| { type: 'boardShow' }
		| { type: 'boardHide' }
		| {
				type: 'boardWithAnimateSymbols';
				symbolPositions: Position[];
				clusters?: Position[][];
				animationType?: 'win' | 'scatter';
		  };
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { BoardContext } from 'components-shared';

	import { getContext } from '../game/context';
	import { getSymbolInfo } from '../game/utils';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import BoardBase from './BoardBase.svelte';

	const context = getContext();

	let show = $state(true);

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => context.stateGameDerived.enhancedBoard.stop(),
		boardSettle: ({ board }) => context.stateGameDerived.enhancedBoard.settle(board),
		boardShow: () => (show = true),
		boardHide: () => (show = false),
		boardWithAnimateSymbols: async ({ symbolPositions, animationType = 'win' }) => {
			// Deduplicate positions — if the same cell appears in multiple clusters,
			// only animate it once. Without this, the last oncomplete overwrites
			// earlier ones, leaving unresolved promises that hang the game.
			const seen = new Set<string>();
			const uniquePositions = symbolPositions.filter((p) => {
				const key = `${p.reel},${p.row}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});

			const getPromises = () =>
				uniquePositions.map(async (position) => {
					const reel = context.stateGame.board[position.reel];
					const reelSymbol = reel?.reelState.symbols[position.row];
					if (!reelSymbol) return;

					// If win symbolInfo is the same object as current symbolInfo,
					// the Spine animation won't restart and oncomplete will never fire.
					// This happens for MET (wild) which uses the same spine config for all states.
					const currentInfo = getSymbolInfo({ rawSymbol: reelSymbol.rawSymbol, state: reelSymbol.symbolState });
					const winInfo = getSymbolInfo({ rawSymbol: reelSymbol.rawSymbol, state: 'win' });
					if (currentInfo === winInfo) {
						reelSymbol.symbolState = 'postWinStatic';
						return;
					}

					if (animationType === 'scatter') return; // scatter overlay handles visuals
					reelSymbol.symbolState = 'win';
					await waitForResolve((resolve) => (reelSymbol.oncomplete = resolve));
					reelSymbol.symbolState = 'postWinStatic';
				});

			await Promise.all(getPromises());
		},
	});

	$effect(() => {
		// Re-run readyToSpinEffect whenever the board is recreated (e.g. after resizeBoard).
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		context.stateGameDerived.enhancedBoardVersion;
		context.stateGameDerived.enhancedBoard.readyToSpinEffect();
	});
</script>

{#if show}
	<BoardContext animate={false}>
		<BoardContainer>
			<BoardMask />
			<BoardBase />
		</BoardContainer>
	</BoardContext>

	<BoardContext animate={true}>
		<BoardContainer>
			<BoardBase />
		</BoardContainer>
	</BoardContext>
{/if}
