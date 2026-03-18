<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventFreeSpinOutro =
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { BitmapText } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider, ResponsiveBitmapText } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { waitForResolve } from 'utils-shared/wait';
	import { CanvasSizeRectangle } from 'components-layout';
	import { OnMount } from 'components-shared';

	import { getContext } from '../game/context';
	import FreeSpinAnimation from './FreeSpinAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';
	import WinCoins from './WinCoins.svelte';

	const context = getContext();

	let show = $state(true);
	let amount = $state(0);
	let winLevelData = $state<WinLevelData | undefined>(undefined);
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => (show = true),
		freeSpinOutroHide: async () => (show = false),
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<FadeContainer {show}>
	<WinCountUpProvider
		{amount}
		duration={winLevelData?.presentDuration ?? 1500}
		oncomplete={() => onCountUpComplete()}
	>
		{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
			{#if winLevelData}
				<OnMount onmount={() => startCountUp()} />

				<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />

				<FreeSpinAnimation>
					{#snippet children({ sizes })}
						<BitmapText
							y={-sizes.height * 0.3}
							anchor={{ x: 0.5, y: 0.5 }}
							text={'YOU WON'}
							style={{ fontFamily: 'purple', fontSize: sizes.width * 0.1 }}
						/>

						<ResponsiveBitmapText
							y={0}
							anchor={{ x: 0.5, y: 0.5 }}
							style={{
								fontFamily: 'purple',
								fontSize: sizes.width * 0.15,
							}}
							text={bookEventAmountToCurrencyString(countUpAmount)}
							maxWidth={sizes.width}
						/>

						<BitmapText
							y={sizes.height * 0.3}
							anchor={{ x: 0.5, y: 0.5 }}
							text="TOTAL WIN"
							style={{ fontFamily: 'purple', fontSize: sizes.width * 0.07 }}
						/>
					{/snippet}
				</FreeSpinAnimation>

				<WinCoins emit={!countUpCompleted} levelAlias={winLevelData.alias} />

				<PressToContinue onpress={() => (countUpCompleted ? oncomplete() : finishCountUp())} />
			{/if}
		{/snippet}
	</WinCountUpProvider>
</FadeContainer>
