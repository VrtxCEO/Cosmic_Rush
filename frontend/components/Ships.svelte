<script lang="ts">
	import { onMount } from 'svelte';
	import { Ticker } from 'pixi.js';
	import { Sprite, Graphics } from 'pixi-svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	const SHIP_SIZE = 32;
	const FRAME_SCALE = 1.6;
	const FRAME_OFFSET_Y = 15;

	// Laser bolt state
	type Laser = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		life: number; // ms remaining
		color: number;
	};

	let lasers: Laser[] = $state([]);

	function createShip(speed: number, key: string, shootCooldown: number, laserColor: number, targetIndex: number) {
		let angle = Math.random() * Math.PI * 2;
		return {
			x: 0,
			y: 0,
			angle,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			turnTimer: 0,
			turnInterval: 1000 + Math.random() * 2000,
			speed,
			key,
			shootCooldown,
			shootTimer: Math.random() * shootCooldown,
			laserColor,
			targetIndex, // which ship index to shoot at
		};
	}

	// All 6 ships
	const ships = [
		createShip(0.08, 'ship_fighter.png',    2200, 0xff4444, 1),
		createShip(0.06, 'ship_dark.png',        2800, 0xff8800, 2),
		createShip(0.04, 'ship_shuttle.png',     3500, 0x44ffff, 3),
		createShip(0.09, 'ship_interceptor.png', 1800, 0xaa44ff, 4),
		createShip(0.07, 'ship_warship.png',     2400, 0xff6600, 0),
		createShip(0.05, 'ship_scout.png',       2000, 0x44ffff, 3),
	];

	// Reactive display state — one array entry per ship
	type ShipState = { x: number; y: number; angle: number };
	let shipStates: ShipState[] = $state(ships.map(() => ({ x: 0, y: 0, angle: 0 })));

	function getFrameBounds() {
		const board = context.stateGameDerived.boardLayout();
		const hw = (board.width * FRAME_SCALE) / 2;
		const hh = (board.height * FRAME_SCALE) / 2;
		const cx = board.x;
		const cy = board.y + FRAME_OFFSET_Y;
		const outer = { left: cx - hw, right: cx + hw, top: cy - hh, bottom: cy + hh };
		const margin = 10;
		const inner = {
			left: cx - board.width / 2 + margin,
			right: cx + board.width / 2 - margin,
			top: cy - board.height / 2 - FRAME_OFFSET_Y + margin,
			bottom: cy + board.height / 2 - FRAME_OFFSET_Y - margin,
		};
		return { outer, inner };
	}

	function isInReelArea(x: number, y: number, inner: ReturnType<typeof getFrameBounds>['inner']) {
		return x > inner.left && x < inner.right && y > inner.top && y < inner.bottom;
	}

	function updateShip(
		ship: ReturnType<typeof createShip>,
		dt: number,
		bounds: { left: number; right: number; top: number; bottom: number },
		avoidInner?: ReturnType<typeof getFrameBounds>['inner'],
	) {
		ship.turnTimer += dt;
		if (ship.turnTimer > ship.turnInterval) {
			ship.turnTimer = 0;
			ship.turnInterval = 1000 + Math.random() * 2000;
			const turnAmount = (Math.random() - 0.5) * Math.PI * 0.8;
			ship.angle += turnAmount;
			ship.vx = Math.cos(ship.angle) * ship.speed;
			ship.vy = Math.sin(ship.angle) * ship.speed;
		}

		let nx = ship.x + ship.vx * dt;
		let ny = ship.y + ship.vy * dt;

		if (nx < bounds.left || nx > bounds.right) {
			ship.vx *= -1;
			ship.angle = Math.atan2(ship.vy, ship.vx);
			nx = Math.max(bounds.left, Math.min(bounds.right, nx));
		}
		if (ny < bounds.top || ny > bounds.bottom) {
			ship.vy *= -1;
			ship.angle = Math.atan2(ship.vy, ship.vx);
			ny = Math.max(bounds.top, Math.min(bounds.bottom, ny));
		}

		if (avoidInner && isInReelArea(nx, ny, avoidInner)) {
			const cx = (avoidInner.left + avoidInner.right) / 2;
			const cy = (avoidInner.top + avoidInner.bottom) / 2;
			ship.angle = Math.atan2(ny - cy, nx - cx);
			ship.vx = Math.cos(ship.angle) * ship.speed;
			ship.vy = Math.sin(ship.angle) * ship.speed;
			nx = ship.x + ship.vx * dt;
			ny = ship.y + ship.vy * dt;
		}

		ship.x = nx;
		ship.y = ny;
	}

	function fireLaser(shooter: ReturnType<typeof createShip>) {
		const target = ships[shooter.targetIndex];
		const dx = target.x - shooter.x;
		const dy = target.y - shooter.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < 5) return;
		const speed = 0.35;
		lasers.push({
			x: shooter.x,
			y: shooter.y,
			vx: (dx / dist) * speed,
			vy: (dy / dist) * speed,
			life: dist / speed + 200,
			color: shooter.laserColor,
		});
	}

	let initialized = false;

	onMount(() => {
		const ticker = Ticker.shared;
		const update = () => {
			const dt = ticker.deltaMS;
			const { outer, inner } = getFrameBounds();
			const canvas = context.stateLayoutDerived.canvasSizes();
			const bgBounds = { left: 20, right: canvas.width - 20, top: 20, bottom: canvas.height - 20 };

			if (!initialized) {
				ships[0].x = outer.left + 30;   ships[0].y = (outer.top + inner.top) / 2;
				ships[1].x = outer.right - 30;  ships[1].y = (outer.bottom + inner.bottom) / 2;
				ships[2].x = canvas.width * 0.2; ships[2].y = canvas.height * 0.2;
				ships[3].x = outer.left + 60;   ships[3].y = outer.bottom - 40;
				ships[4].x = outer.right - 60;  ships[4].y = outer.top + 40;
				ships[5].x = canvas.width * 0.8; ships[5].y = canvas.height * 0.8;
				initialized = true;
			}

			// Update ships — 0,1,3,4 avoid reel; 2,5 roam full canvas
			updateShip(ships[0], dt, outer, inner);
			updateShip(ships[1], dt, outer, inner);
			updateShip(ships[2], dt, bgBounds);
			updateShip(ships[3], dt, outer, inner);
			updateShip(ships[4], dt, outer, inner);
			updateShip(ships[5], dt, bgBounds);

			// Shooting
			for (const ship of ships) {
				ship.shootTimer += dt;
				if (ship.shootTimer >= ship.shootCooldown) {
					ship.shootTimer = 0;
					fireLaser(ship);
				}
			}

			// Update lasers
			const nextLasers: Laser[] = [];
			for (const laser of lasers) {
				laser.x += laser.vx * dt;
				laser.y += laser.vy * dt;
				laser.life -= dt;
				if (laser.life > 0) nextLasers.push(laser);
			}
			lasers = nextLasers;

			// Update reactive display states
			for (let i = 0; i < ships.length; i++) {
				shipStates[i] = { x: ships[i].x, y: ships[i].y, angle: ships[i].angle };
			}
		};
		ticker.add(update);
		return () => ticker.remove(update);
	});
</script>

{#each shipStates as s, i}
	<Sprite
		key={ships[i].key}
		anchor={0.5}
		x={s.x}
		y={s.y}
		width={i === 1 ? SHIP_SIZE : i === 4 ? SHIP_SIZE * 1.2 : SHIP_SIZE * 0.9}
		height={i === 1 ? SHIP_SIZE : i === 4 ? SHIP_SIZE * 1.2 : SHIP_SIZE * 0.9}
		rotation={s.angle + Math.PI / 2}
	/>
{/each}

<Graphics
	draw={(g) => {
		g.clear();
		for (const laser of lasers) {
			const len = 8;
			const dx = laser.vx;
			const dy = laser.vy;
			const dist = Math.sqrt(dx * dx + dy * dy) || 1;
			g.moveTo(laser.x, laser.y);
			g.lineTo(laser.x - (dx / dist) * len, laser.y - (dy / dist) * len);
			g.setStrokeStyle({ width: 2, color: laser.color, alpha: 0.9 });
			g.stroke();
		}
	}}
/>
