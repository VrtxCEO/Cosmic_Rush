<script lang="ts">
	import { onMount } from 'svelte';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App } from 'pixi-svelte';
	import { stateModal, stateMeta } from 'state-shared';

	import { UI, UiGameName } from 'components-ui-pixi';
	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import Background from './Background.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import GridOverlay from './GridOverlay.svelte';
	import BoardContainer from './BoardContainer.svelte';
	import Board from './Board.svelte';
	import TumbleBoard from './TumbleBoard.svelte';
	import Win from './Win.svelte';

	import BoardFrame from './BoardFrame.svelte';
	import Ships from './Ships.svelte';

	import Anticipations from './Anticipations.svelte';
	import ClusterGlowOverlay from './ClusterGlowOverlay.svelte';
	import ScatterOverlay from './ScatterOverlay.svelte';
	import ClusterWinAmounts from './ClusterWinAmounts.svelte';
	import GlobalMultiplier from './GlobalMultiplier.svelte';
	import FreeSpinIntro from './FreeSpinIntro.svelte';
	import FreeSpinCounter from './FreeSpinCounter.svelte';
	import FreeSpinOutro from './FreeSpinOutro.svelte';
	import Transition from './Transition.svelte';
	import CosmicBreakCorners from './CosmicBreakCorners.svelte';
	import BonusExtraSpins from './BonusExtraSpins.svelte';
	import DevPanel from './DevPanel.svelte';
	import PayTable from './PayTable.svelte';
	import GameRules from './GameRules.svelte';
	import MeteorMultiplierOverlay from './MeteorMultiplierOverlay.svelte';

	const context = getContext();

	// Override default SDK bet mode meta to show only the Cosmic Break buy bonus
	stateMeta.betModeMeta = {
		BASE: {
			mode: 'BASE',
			costMultiplier: 1.0,
			type: 'default',
			parent: '',
			children: '',
			assets: { icon: '', dialogImage: '', dialogVolatility: '', volatility: '', button: '' },
			text: { title: '', dialog: '', button: '', betAmountLabel: '', tickerIdle: '', tickerSpin: '', bannerText: '' },
		},
		BONUS: {
			mode: 'BONUS',
			costMultiplier: 500,
			type: 'buy',
			parent: '',
			children: '',
			assets: { icon: '', dialogImage: '', dialogVolatility: '', volatility: '', button: '' },
			text: {
				title: 'COSMIC BREAK',
				dialog: 'Directly enter the Cosmic Break bonus! Play on an 8×8 grid with 10 free spins. Unlock the 4 corner zones to earn multipliers up to 9× — unlock all 4 for +5 extra spins.',
				description: '10 free spins on an 8×8 grid. Unlock corners for multipliers up to 9×.',
				button: 'BUY',
				betAmountLabel: 'COSMIC BREAK',
				tickerIdle: 'PLACE YOUR BET',
				tickerSpin: 'COSMIC BREAK ACTIVATED',
				bannerText: '',
			},
		},
	};

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});
</script>

<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />
	<EnablePixiExtension />

	<Background />

	{#if !context.stateLayout.showLoadingScreen}
		<ResumeBet />
		<Sound />

		<MainContainer>
			<BoardFrame />
			<Ships />
		</MainContainer>

		<MainContainer>
			<BoardContainer>
				<GridOverlay />
			</BoardContainer>
			<Board />
		</MainContainer>

		<MainContainer>
			<TumbleBoard />
		</MainContainer>

		<UI>
			{#snippet gameName()}
				<UiGameName name="COSMIC RUSH" />
			{/snippet}
			{#snippet logo()}{/snippet}
		</UI>
		<Win />

		<MainContainer>
			<Anticipations />
			</MainContainer>
		<MainContainer>
			<ClusterGlowOverlay />
			<ScatterOverlay />
			<ClusterWinAmounts />
		</MainContainer>

		<GlobalMultiplier />
		<FreeSpinCounter />
		<MeteorMultiplierOverlay />
		<CosmicBreakCorners />
		<BonusExtraSpins />
		<FreeSpinIntro />
		<FreeSpinOutro />
		<Transition />
	{/if}
</App>

{#if context.stateLayout.showLoadingScreen}
	<LoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
{/if}

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
	{#snippet payTable()}
		<PayTable />
	{/snippet}
	{#snippet gameRules()}
		<GameRules />
	{/snippet}
</Modals>

<DevPanel />
