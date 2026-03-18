<script lang="ts">
	import { stateApp } from '../game/stateApp';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();

	const assetsLoaded = $derived(stateApp.loaded);
	const loadProgress = $derived(stateApp.loadingProgress);

	$effect(() => {
		if (assetsLoaded) {
			// small delay so the image is visible briefly before game mounts
		}
	});
</script>

<div class="loading-overlay">
	<img src="/assets/sprites/Cosmic_Rush_Loading_Screen.png" alt="Cosmic Rush" class="bg" />

	{#if !assetsLoaded}
		<div class="loading-bar-container">
			<div class="loading-bar-track">
				<div class="loading-bar-fill" style="width: {loadProgress}%"></div>
			</div>
			<p class="loading-text">LOADING...</p>
		</div>
	{/if}

	{#if assetsLoaded}
		<button class="play-button" onclick={() => props.onloaded()}>
			PLAY
		</button>
	{/if}
</div>

<style>
	.loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background: #000;
		overflow: hidden;
	}

	.bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.loading-bar-container {
		position: absolute;
		bottom: 10%;
		left: 50%;
		transform: translateX(-50%);
		width: 60%;
		max-width: 400px;
		text-align: center;
	}

	.loading-bar-track {
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 3px;
		overflow: hidden;
	}

	.loading-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #ffd700, #ffec80);
		border-radius: 3px;
		transition: width 0.3s ease-out;
	}

	.loading-text {
		font-family: 'proxima-nova', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(255, 215, 0, 0.7);
		letter-spacing: 0.3em;
		margin-top: 12px;
	}

	.play-button {
		position: absolute;
		bottom: 10%;
		left: 50%;
		transform: translateX(-50%);
		background: transparent;
		border: 2px solid #ffd700;
		color: #ffd700;
		font-family: 'proxima-nova', sans-serif;
		font-size: 1.4rem;
		font-weight: 600;
		letter-spacing: 0.3em;
		padding: 14px 48px;
		cursor: pointer;
		transition: background 0.2s, color 0.2s;
	}

	.play-button:hover {
		background: #ffd700;
		color: #000;
	}
</style>
