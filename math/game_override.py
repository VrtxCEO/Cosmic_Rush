from game_executables import GameExecutables
from game_events import freespin_trigger_bonus_event
from src.events.events import fs_trigger_event, reveal_event
from src.calculations.statistics import get_random_outcome


def _scatter_positions_with_padding(gs, scatter_key: str):
    """Return scatter positions, adding +1 row if padding is enabled."""
    positions = []
    for reel, _ in enumerate(gs.special_syms_on_board[scatter_key]):
        pos = gs.special_syms_on_board[scatter_key][reel]
        positions.append({"reel": pos["reel"], "row": pos["row"]})
    if gs.config.include_padding:
        for pos in positions:
            pos["row"] += 1
    return positions


class GameStateOverride(GameExecutables):
    """
    Override or extend universal state.py functions for Star Gazing.
    """

    def _has_duplicate_scatter_column(self, scatter_key: str = "scatter") -> bool:
        """Return True if any reel (column) contains more than one scatter symbol."""
        reels_seen = set()
        for pos in self.special_syms_on_board[scatter_key]:
            if pos["reel"] in reels_seen:
                return True
            reels_seen.add(pos["reel"])
        return False

    def reset_book(self):
        super().reset_book()
        self.tumble_win = 0
        self.bonus_type = None  # "cosmicBreak" | None

    def reset_fs_spin(self):
        super().reset_fs_spin()
        self.reset_grid_mults()

    def draw_board(self, emit_event: bool = True, trigger_symbol: str = "scatter") -> None:
        """Override draw_board to enforce one scatter per column."""
        conditions = self.get_current_distribution_conditions()
        if conditions["force_freegame"] and self.gametype == self.config.basegame_type:
            num_scatters = get_random_outcome(conditions["scatter_triggers"])
            self.force_special_board(trigger_symbol, num_scatters)
            # Re-force if the result placed >1 scatter in any column
            while self._has_duplicate_scatter_column(trigger_symbol):
                self.force_special_board(trigger_symbol, num_scatters)
        elif not conditions["force_freegame"] and self.gametype == self.config.basegame_type:
            self.create_board_reelstrips()
            while (
                self.count_special_symbols(trigger_symbol) >= min(
                    self.config.freespin_triggers[self.gametype].keys()
                )
                or self._has_duplicate_scatter_column(trigger_symbol)
            ):
                self.create_board_reelstrips()
        else:
            self.create_board_reelstrips()

        if emit_event:
            reveal_event(self)

    def assign_special_sym_function(self):
        pass

    def determine_bonus_type(self):
        """Determine bonus type from scatter count on the board.

        4 SUN → Cosmic Break (8x8, locked corners)
        """
        scatter_count = self.count_special_symbols("scatter")
        return self.config.bonus_type_map.get(scatter_count)

    def update_freespin_amount(self, scatter_key: str = "scatter") -> None:
        """Set initial number of spins for a freegame and emit trigger event with bonusType."""
        scatter_count = self.count_special_symbols(scatter_key)
        max_key = max(self.config.freespin_triggers[self.gametype].keys())
        effective_count = min(scatter_count, max_key)

        self.tot_fs = self.config.freespin_triggers[self.gametype][effective_count]
        self.bonus_type = self.determine_bonus_type()

        if self.gametype == self.config.basegame_type:
            positions = _scatter_positions_with_padding(self, scatter_key)
            freespin_trigger_bonus_event(self, self.bonus_type, effective_count, positions=positions)
        else:
            # fallback to base implementation for freegame triggers
            super().update_freespin_amount(scatter_key)

    def update_fs_retrigger_amt(self, scatter_key: str = "scatter") -> None:
        """Update total freespin amount on retrigger (cap scatter count to avoid missing keys)."""
        scatter_count = self.count_special_symbols(scatter_key)
        max_key = max(self.config.freespin_triggers[self.gametype].keys())
        effective_count = min(scatter_count, max_key)
        self.tot_fs += self.config.freespin_triggers[self.gametype][effective_count]
        fs_trigger_event(self, freegame_trigger=True, basegame_trigger=False)

    def check_repeat(self) -> None:
        """Checks if the spin failed a criteria constraint at any point."""
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is not None and self.final_win != win_criteria:
                self.repeat = True

            conditions = self.get_current_distribution_conditions()

            if conditions["force_freegame"] and not (self.triggered_freegame):
                self.repeat = True

            # Validate the correct bonus type triggered for bonus-specific criteria
            forced_bonus = conditions.get("force_bonus_type")
            if forced_bonus and self.bonus_type != forced_bonus:
                self.repeat = True

            if self.win_manager.running_bet_win == 0 and self.criteria != "0":
                self.repeat = True
