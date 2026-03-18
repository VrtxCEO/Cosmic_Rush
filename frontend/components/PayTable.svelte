<script lang="ts">
	import config from '../game/config';

	const symbols = [
		{ key: 'NEP', label: 'Neptune' },
		{ key: 'URA', label: 'Uranus' },
		{ key: 'SAT', label: 'Saturn' },
		{ key: 'JUP', label: 'Jupiter' },
		{ key: 'MAR', label: 'Mars' },
		{ key: 'EAR', label: 'Earth' },
		{ key: 'VEN', label: 'Venus' },
		{ key: 'MER', label: 'Mercury' },
		{ key: 'PLU', label: 'Pluto' },
	] as const;

	const SHOW_CLUSTERS = [4, 6, 8, 10, 12, 15, 20, 25];

	function getPayout(symbolKey: string, cluster: number): string {
		const entry = (config.symbols as any)[symbolKey];
		if (!entry?.paytable) return '—';
		const match = entry.paytable.find((p: any) => Object.keys(p)[0] === String(cluster));
		return match ? `${Object.values(match)[0]}x` : '—';
	}
</script>

<div class="paytable">
	<h2>COSMIC RUSH — PAYTABLE</h2>
	<p class="subtitle">Cluster pays · Min 4 matching symbols · All pays × Bet</p>

	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Symbol</th>
					{#each SHOW_CLUSTERS as n}
						<th>{n}+</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each symbols as { key, label }}
					<tr>
						<td class="sym-name">{label}<br /><span class="sym-key">{key}</span></td>
						{#each SHOW_CLUSTERS as n}
							<td>{getPayout(key, n)}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="specials">
		<div class="special-card">
			<strong>MET — Meteor (Wild)</strong>
			<p>Substitutes for all regular symbols. Each meteor carries a random multiplier (1×–10×) applied to every cluster it contributes to. Adjacent meteors merge their multipliers.</p>
		</div>
		<div class="special-card">
			<strong>SUN — Scatter</strong>
			<p>4 or more SUN symbols anywhere trigger the Cosmic Break bonus.</p>
		</div>
	</div>

	<p class="rtp">RTP: {(config.rtp * 100).toFixed(0)}% · Max Win: {config.betModes.base.max_win}×</p>
</div>

<style>
	.paytable {
		color: #ddd;
		font-family: monospace;
		padding: 0.5rem 0;
		max-width: 600px;
	}
	h2 {
		color: #0ff;
		font-size: 1rem;
		letter-spacing: 2px;
		margin: 0 0 0.25rem;
	}
	.subtitle {
		color: #888;
		font-size: 0.75rem;
		margin: 0 0 1rem;
	}
	.table-wrap {
		overflow-x: auto;
		margin-bottom: 1rem;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 0.8rem;
	}
	th {
		color: #0ff;
		border-bottom: 1px solid #333;
		padding: 4px 6px;
		text-align: center;
		white-space: nowrap;
	}
	td {
		padding: 4px 6px;
		text-align: center;
		border-bottom: 1px solid #1a1a1a;
	}
	td.sym-name {
		text-align: left;
		color: #fff;
	}
	.sym-key {
		color: #0ff;
		font-size: 0.7rem;
	}
	.specials {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	.special-card {
		background: rgba(0, 255, 255, 0.05);
		border: 1px solid #0ff3;
		border-radius: 4px;
		padding: 0.5rem 0.75rem;
		font-size: 0.8rem;
	}
	.special-card strong {
		color: #0ff;
	}
	.special-card p {
		margin: 0.25rem 0 0;
		color: #aaa;
	}
	.rtp {
		color: #666;
		font-size: 0.7rem;
		text-align: center;
	}
</style>
