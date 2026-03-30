<script lang="ts">
	import { stateBet, stateBetDerived } from 'state-shared';
	import { getContext } from '../game/context';
	import { onMount } from 'svelte';

	const context = getContext();

	onMount(() => {
		if (stateBet.betToResume?.active) {
			if (stateBet.betToResume.mode) {
				stateBet.activeBetModeKey = stateBet.betToResume.mode;
			}
			if (stateBet.betToResume.amount) {
				stateBetDerived.setBetAmount(stateBet.betToResume.amount / 1_000_000);
			}
		}
		context.eventEmitter.broadcast({ type: 'resumeBet' });
	});
</script>
