"""Debug simulation to identify payout mismatch."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.state.state import GeneralGameState

_orig = GeneralGameState.update_final_win

def debug_update_final_win(self):
    lhs = min(
        round(self.win_manager.basegame_wins + self.win_manager.freegame_wins, 2),
        self.config.wincap,
    )
    rhs = round(min(self.win_manager.running_bet_win, self.config.wincap), 2)
    if lhs != rhs:
        print(
            f"MISMATCH! base={self.win_manager.basegame_wins} "
            f"free={self.win_manager.freegame_wins} "
            f"sum={round(self.win_manager.basegame_wins + self.win_manager.freegame_wins, 2)} "
            f"running={self.win_manager.running_bet_win} "
            f"bonus={getattr(self, 'bonus_type', None)}"
        )
    _orig(self)

GeneralGameState.update_final_win = debug_update_final_win

from gamestate import GameState
from game_config import GameConfig
from src.state.run_sims import create_books

if __name__ == "__main__":
    c = GameConfig()
    gs = GameState(c)
    c.meteor_random_trigger_chance = 0.0

    print("Starting sims...")
    num_sim_args = {"base": 100, "bonus": 100}
    create_books(gs, c, num_sim_args, 100, 1, False, False)
    print("Done!")
