<script lang="ts">
	import { onMount } from 'svelte';
	import { Ticker } from 'pixi.js';
	import { Container, Sprite } from 'pixi-svelte';

	type Props = {
		value: number;
		digitHeight: number;
		x?: number;
		y?: number;
	};

	const props: Props = $props();

	const DIGIT_ASPECT = 0.7; // approximate width:height ratio for the rocket numbers
	const digitWidth = $derived(props.digitHeight * DIGIT_ASPECT);
	const padded = $derived(String(props.value).padStart(2, '0'));
	const digits = $derived(padded.split(''));
	const totalWidth = $derived(digits.length * digitWidth * 0.85); // slight overlap

	// Hover animation — each digit bobs independently with offset phase
	let elapsed = $state(0);

	onMount(() => {
		const ticker = Ticker.shared;
		const update = () => {
			elapsed += ticker.deltaMS * 0.003;
		};
		ticker.add(update);
		return () => ticker.remove(update);
	});
</script>

<Container x={(props.x ?? 0) - totalWidth * 0.5} y={props.y ?? 0}>
	{#each digits as digit, i}
		{@const phase = i * 0.8}
		{@const hoverY = Math.sin(elapsed + phase) * 3}
		<Sprite
			key={`num_${digit}.png`}
			x={i * digitWidth * 0.85}
			y={hoverY}
			width={digitWidth}
			height={props.digitHeight}
			anchor={{ x: 0, y: 0.5 }}
		/>
	{/each}
</Container>
