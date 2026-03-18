"""
Star Gazing bonus feature implementations.

Bonus type:
- Cosmic Break: 4 SUN → 8x8, locked corners, progressive multiplier
"""

import random
from copy import deepcopy

from src.events.events import update_freespin_event, reveal_event, tumble_board_event

from game_events import (
    update_grid_mult_event,
    meteor_land_event,
    cosmic_break_init_event,
    cosmic_break_corner_update_event,
    cosmic_break_full_unlock_event,
)


# ─── Cosmic Break Bonus ────────────────────────────────────────────



class CosmicBreakBonus:
    """Cosmic Break Bonus: 8x8 grid, locked corners, progressive multiplier.

    Rules:
    - 10 free spins on 8x8 grid
    - 4 corner 3x3 locked zones, unlocking in fixed order
    - Each cluster payout = 1 hit; hits flow to the active corner
    - Corner thresholds: 3, 6, 9, 12 cumulative hits
    - Each unlock = +2x multiplier (stacking: 1→3→5→7→9)
    - All 4 unlocked = +5 extra spins
    - Grid position multipliers active
    """

    def __init__(self, gs):
        self.gs = gs
        self.config = gs.config
        self.corners = deepcopy(self.config.cosmic_break_corners)
        for corner in self.corners:
            corner["hits"] = 0
            corner["unlocked"] = False
        self.bonus_multiplier = 1
        self.full_unlock_awarded = False
        self._original_num_reels = gs.config.num_reels
        self._original_num_rows = list(gs.config.num_rows)
        self._original_reel_weights = None

    def _resize_to_8x8(self):
        """Swap config to 8x8 grid and override reel weights to 8-column strips."""
        self.config.num_reels = 8
        self.config.num_rows = [8] * 8
        # Override freegame reel weights so draw_board picks an 8-column strip
        conditions = self.gs.get_current_distribution_conditions()
        self._original_reel_weights = deepcopy(conditions["reel_weights"])
        conditions["reel_weights"][self.config.freegame_type] = {"MB0": 1}

    def _restore_grid(self):
        """Restore original 5x5 config and reel weights."""
        self.config.num_reels = self._original_num_reels
        self.config.num_rows = list(self._original_num_rows)
        if self._original_reel_weights is not None:
            conditions = self.gs.get_current_distribution_conditions()
            conditions["reel_weights"] = self._original_reel_weights

    def run(self):
        """Main Cosmic Break bonus loop."""
        self._resize_to_8x8()
        try:
            cosmic_break_init_event(self.gs, self.corners)

            # Reset grid mults for 8x8
            self.gs.position_multipliers = [
                [0 for _ in range(8)] for _ in range(8)
            ]

            while self.gs.fs < self.gs.tot_fs:
                self.gs.fs += 1
                update_freespin_event(self.gs)
                self.gs.win_manager.reset_spin_win()
                self.gs.tumblewin_mult = 0
                self.gs.win_data = {}

                # Draw board, resolve MET variants, then record board event
                self.gs.draw_board(emit_event=False)
                self._block_locked_positions()
                self._assign_met_multipliers()
                reveal_event(self.gs)
                update_grid_mult_event(self.gs)

                # Evaluate clusters, then absorb multipliers from winning METs
                self.gs.get_clusters_update_wins()
                self._absorb_winning_met_multipliers()
                self._apply_bonus_multiplier()
                self.gs.emit_tumble_win_events()
                self.gs.update_grid_mults()
                self._check_corner_hits()

                # Tumble loop
                while self.gs.win_data["totalWin"] > 0 and not self.gs.wincap_triggered:
                    self.gs.tumble_board()
                    self._block_locked_positions()
                    self._assign_met_multipliers()
                    tumble_board_event(self.gs)
                    self.gs.get_clusters_update_wins()
                    self._absorb_winning_met_multipliers()
                    self._apply_bonus_multiplier()
                    self.gs.emit_tumble_win_events()
                    self.gs.update_grid_mults()
                    self._check_corner_hits()

                self.gs.set_end_tumble_event()
                self.gs.win_manager.update_gametype_wins(self.gs.gametype)

                # Check retrigger
                if self.gs.check_fs_condition():
                    self.gs.update_fs_retrigger_amt()

                if self.gs.wincap_triggered:
                    break
        finally:
            self._restore_grid()

    def _block_locked_positions(self):
        """Mark locked corner positions so they are visible but ignored in clusters."""
        for corner in self.corners:
            for reel, row in corner["positions"]:
                if reel < len(self.gs.board) and row < len(self.gs.board[reel]):
                    sym = self.gs.board[reel][row]
                    if corner["unlocked"]:
                        sym.locked = False
                    else:
                        sym.locked = True
                        sym.explode = False

    # Distribution: 50% plain wild, 25% → 2-4x, 15% → 5-8x, 10% → 9-10x
    _MULT_POOL    = [None, 2,   3,   4,   5,  6,  7,  8,  9,  10]
    _MULT_WEIGHTS = [600,  100, 100, 100, 70, 70, 70, 70, 40, 40]

    def _assign_met_multipliers(self):
        """Resolve plain MET symbols into MET2–MET10 (or leave as MET) using weighted distribution."""
        for reel in range(len(self.gs.board)):
            for row in range(len(self.gs.board[reel])):
                sym = self.gs.board[reel][row]
                if sym.name == 'MET':
                    mult = random.choices(self._MULT_POOL, self._MULT_WEIGHTS)[0]
                    if mult is not None:
                        new_sym = self.gs.symbol_storage.create_symbol(f'MET{mult}')
                        new_sym.multiplier = mult
                        self.gs.board[reel][row] = new_sym

    def _absorb_winning_met_multipliers(self):
        """After cluster eval, absorb multipliers only from METs that contributed to a win (explode=True)."""
        meteors = []
        for reel in range(len(self.gs.board)):
            for row in range(len(self.gs.board[reel])):
                sym = self.gs.board[reel][row]
                if sym.name.startswith('MET') and sym.name != 'MET' and sym.explode and sym.multiplier and sym.multiplier > 0:
                    meteors.append({"reel": reel, "row": row, "multiplier": sym.multiplier})
                    self.bonus_multiplier += sym.multiplier
        if meteors:
            meteor_land_event(self.gs, meteors, self.bonus_multiplier)

    def _apply_bonus_multiplier(self):
        """Apply the corner unlock multiplier to all wins this tumble."""
        if self.bonus_multiplier > 1 and self.gs.win_data.get("totalWin", 0) > 0:
            original_total = self.gs.win_data["totalWin"]
            new_total = 0
            for win in self.gs.win_data["wins"]:
                win["win"] *= self.bonus_multiplier
                win["meta"]["bonusMult"] = self.bonus_multiplier
                new_total += win["win"]
            self.gs.win_data["totalWin"] = new_total

            # Update win manager with the difference
            diff = new_total - original_total
            if diff > 0:
                self.gs.win_manager.update_spinwin(diff)

    def _check_corner_hits(self):
        """Progressive sequential corner unlocking.

        Corners unlock in fixed order (topLeft → topRight → bottomLeft →
        bottomRight).  Each corner needs ``cosmic_break_hits_to_unlock`` hits
        (default 3).  Hits always flow to the first locked corner; overflow
        spills into the next corner.  Cumulative thresholds are therefore
        3, 6, 9, 12 total hits.

        One event is emitted per individual hit so the frontend counter
        advances one step at a time (0/3 → 1/3 → 2/3 → 3/3 → fly-off).
        """
        if self.gs.win_data.get("totalWin", 0) <= 0:
            return

        num_hits = len(self.gs.win_data.get("wins", []))
        if num_hits == 0:
            return

        for _ in range(num_hits):
            # Find the next locked corner in order
            active = None
            for c in self.corners:
                if not c["unlocked"]:
                    active = c
                    break

            if active is None:
                break  # all corners already unlocked

            active["hits"] += 1
            newly_unlocked = []

            if active["hits"] >= self.config.cosmic_break_hits_to_unlock:
                active["unlocked"] = True
                self.bonus_multiplier += self.config.cosmic_break_unlock_multiplier
                self.gs.tot_fs += self.config.cosmic_break_corner_extra_spins
                newly_unlocked.append(active["id"])

            extra_spins_added = self.config.cosmic_break_corner_extra_spins if newly_unlocked else 0
            cosmic_break_corner_update_event(
                self.gs, self.corners, newly_unlocked, self.bonus_multiplier, extra_spins_added
            )

        # Check full unlock
        if (
            not self.full_unlock_awarded
            and all(c["unlocked"] for c in self.corners)
        ):
            self.full_unlock_awarded = True
            extra = self.config.cosmic_break_full_unlock_extra_spins
            self.gs.tot_fs += extra
            cosmic_break_full_unlock_event(self.gs, extra)
