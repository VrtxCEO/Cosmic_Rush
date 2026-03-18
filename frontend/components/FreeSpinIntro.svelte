<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';

	import { Container, Sprite } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import PressToContinue from './PressToContinue.svelte';

	const context = getContext();

	let show = $state(false);
	let oncomplete = $state(() => {});

	const panelScale = new Tween(0);

	onMount(() => {
		panelScale.set(1, { duration: 350 });
	});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => (show = true),
		freeSpinIntroHide: () => (show = false),
		freeSpinIntroUpdate: async (_emitterEvent) => {
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	const IMG_W = SYMBOL_SIZE * 8;
	const IMG_H = IMG_W * (1024 / 1536);
</script>

<FadeContainer {show}>
	<MainContainer>
		<Container
			x={context.stateGameDerived.boardLayout().x}
			y={context.stateGameDerived.boardLayout().y}
			scale={panelScale.current}
		>
			<Sprite key="freespin_intro.png" anchor={0.5} width={IMG_W} height={IMG_H} />
		</Container>
	</MainContainer>

	<PressToContinue onpress={() => oncomplete()} />
</FadeContainer>
