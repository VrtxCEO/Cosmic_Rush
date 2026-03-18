<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container } from 'pixi-svelte';

	import { getContext } from '../game/context';

	type Props = {
		children: Snippet;
	};

	const props: Props = $props();

	const context = getContext();
</script>

<Container
	x={context.stateGameDerived.boardLayout().x}
	y={context.stateGameDerived.boardLayout().y - 15}
	pivot={context.stateGameDerived.boardLayout().pivot}
	scale={context.stateGameDerived.boardScale()}
>
	{@render props.children()}
</Container>
