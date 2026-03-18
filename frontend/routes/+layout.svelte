<script lang="ts">
	import { type Snippet } from 'svelte';
	import { GlobalStyle } from 'components-ui-html';
	import { LoadI18n } from 'components-shared';
	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';

	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	setContext();
</script>

<GlobalStyle>
	<!-- Auth bypassed for local layout dev — re-enable Authenticate for production -->
	<LoadI18n {messagesMap}>
		<Game />
	</LoadI18n>
</GlobalStyle>

{@render props.children()}
