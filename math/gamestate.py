from game_override import GameStateOverride
from game_events import update_grid_mult_event
from game_bonuses import CosmicBreakBonus


class GameState(GameStateOverride):
    """Core function handling simulation results for Star Gazing."""

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()
            self.draw_board()

            self.get_clusters_update_wins()
            self.emit_tumble_win_events()

            while self.win_data["totalWin"] > 0 and not (self.wincap_triggered):
                self.tumble_game_board()
                self.get_clusters_update_wins()
                self.emit_tumble_win_events()

            self.set_end_tumble_event()
            self.win_manager.update_gametype_wins(self.gametype)

            # Standard scatter-triggered bonus (Cosmic Break only)
            if self.check_fs_condition() and self.check_freespin_entry():
                self.run_freespin_from_base()

            self.evaluate_finalwin()
            self.check_repeat()

        self.imprint_wins()

    def run_freespin(self):
        """Dispatch to the correct bonus based on scatter count."""
        self.reset_fs_spin()

        if self.bonus_type is None:
            self.bonus_type = self.determine_bonus_type()

        if self.bonus_type == "cosmicBreak":
            bonus = CosmicBreakBonus(self)
            bonus.run()
        else:
            # Fallback: standard grid-multiplier free spins
            self._run_standard_freespin()

        self.end_freespin()

    def _run_standard_freespin(self):
        """Original free spin loop, kept as fallback."""
        while self.fs < self.tot_fs:
            self.update_freespin()
            self.draw_board()
            update_grid_mult_event(self)

            self.get_clusters_update_wins()
            self.emit_tumble_win_events()
            self.update_grid_mults()
            while self.win_data["totalWin"] > 0 and not (self.wincap_triggered):
                self.tumble_game_board()
                self.get_clusters_update_wins()
                self.emit_tumble_win_events()
                self.update_grid_mults()

            self.set_end_tumble_event()
            self.win_manager.update_gametype_wins(self.gametype)

            if self.check_fs_condition():
                self.update_fs_retrigger_amt()
