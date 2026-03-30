<script lang="ts">
	import config from '../game/config';
</script>

<div class="rules">
	<h2>COSMIC RUSH — HOW TO PLAY</h2>

	<section>
		<h3>Cluster Pays</h3>
		<p>Form clusters of 4 or more identical symbols touching horizontally or vertically to win. Wins are paid as a multiplier of your total bet. Winning symbols are removed and new symbols fall in (tumble). Tumbles continue until no new clusters form.</p>
	</section>

	<section>
		<h3>MET — Meteor (Wild)</h3>
		<p>The Meteor acts as a wild, substituting for any regular symbol. Each Meteor carries a random multiplier (1×–10×). <strong>During Cosmic Break</strong>, when a Meteor contributes to a winning cluster its multiplier is permanently added to the global win multiplier for the rest of the bonus. All cluster wins for each spin are multiplied by the current global multiplier.</p>
	</section>

	<section>
		<h3>SUN — Scatter</h3>
		<p>Landing 4 or more SUN symbols anywhere on the {config.numReels}×{config.numRows[0]} grid triggers the <strong>Cosmic Break</strong> bonus.</p>
	</section>

	<section>
		<h3>Cosmic Break Bonus</h3>
		<p>The grid expands to 8×8 and you receive <strong>10 free spins</strong>. A global win multiplier starts at 1× and increases as you unlock corner zones.</p>
		<ul>
			<li>The grid has 4 locked corner zones (3×3 each).</li>
			<li>Each corner requires <strong>3 hits</strong> from winning symbols to unlock.</li>
			<li>Every corner unlocked adds <strong>+2×</strong> to the global multiplier (max 9×).</li>
			<li>Unlocking all 4 corners awards <strong>+5 extra spins</strong>.</li>
			<li>Meteor wilds carry a multiplier (2×–10×). When a Meteor contributes to a winning cluster, its multiplier is <strong>permanently added</strong> to the global multiplier — stacking with corner unlocks for the rest of the bonus.</li>
			<li>All cluster wins each spin are multiplied by the current global multiplier.</li>
		</ul>
	</section>

	<section>
		<h3>Buy Bonus</h3>
		<p>Skip straight to the Cosmic Break bonus for <strong>{config.betModes.bonus.cost}×</strong> your bet.</p>
	</section>

	<section>
		<h3>General</h3>
		<ul>
			<li>RTP: {(config.rtp * 100).toFixed(0)}%</li>
			<li>Max Win: {config.betModes.base.max_win}× bet</li>
			<li>All wins are multiplied by your total bet.</li>
		</ul>
	</section>

	<section>
		<h3>Re-Trigger</h3>
		<p>Landing 4 or more SUN scatters during Cosmic Break free spins awards <strong>+5 additional spins</strong>.</p>
	</section>

	<section class="disclaimer">
		<p>Malfunction voids all pays and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted bets. The expected return is calculated over many spins. Animations are not representative of any physical device, and are for illustrative purposes only. TM and © 2025 Stake Engine.</p>
	</section>
</div>

<style>
	.rules {
		color: #ddd;
		font-family: sans-serif;
		font-size: 0.85rem;
		line-height: 1.5;
		padding: 0.25rem 0;
		max-width: 560px;
	}
	h2 {
		color: #0ff;
		font-size: 1rem;
		letter-spacing: 2px;
		margin: 0 0 1rem;
		font-family: monospace;
	}
	section {
		margin-bottom: 1rem;
	}
	h3 {
		color: #0ff;
		font-size: 0.85rem;
		letter-spacing: 1px;
		margin: 0 0 0.25rem;
		text-transform: uppercase;
	}
	p, li {
		color: #bbb;
		margin: 0 0 0.25rem;
	}
	ul {
		padding-left: 1.25rem;
		margin: 0.25rem 0 0;
	}
	strong {
		color: #fff;
	}
	.disclaimer p {
		color: #666;
		font-size: 0.75rem;
		font-style: italic;
	}
</style>
