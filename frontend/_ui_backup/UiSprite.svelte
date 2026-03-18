<script lang="ts" module>
	import { type RectangleProps } from 'pixi-svelte';

	export type Props = RectangleProps & {
		uiType?: 'button' | 'stat';
		key?: string; // accepted but unused — kept for call-site compatibility
	};
</script>

<script lang="ts">
	import { Rectangle } from 'pixi-svelte';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { uiType = 'button', key: _key, ...rest }: Props = $props();
</script>

<!-- Neon electric style matching Spin_Button.png aesthetic -->
<Rectangle
	borderRadius={8}
	backgroundColor={0x060318}
	alpha={0.88}
	borderWidth={2}
	borderColor={0x3366ff}
	{...rest}
/>

<!-- ADD YOUR DESIGN -->
