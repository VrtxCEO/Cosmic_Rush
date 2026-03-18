"""Star Gazing game configuration file/setup"""

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


class GameConfig(Config):
    """Singleton Star Gazing game configuration class."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()
        self.game_id = "star_gazing"
        self.provider_number = 0
        self.working_name = "Star Gazing"
        self.wincap = 5000.0
        self.win_type = "cluster"
        self.rtp = 0.9700
        self.construct_paths()

        # Game Dimensions - 5x5 board (base)
        self.num_reels = 5
        self.num_rows = [5] * self.num_reels

        # Paytable: cluster sizes 4-64 for 9 paying symbols
        # Sizes 4-25 for 5x5 base, sizes 26-64 for 8x8 Cosmic Break
        pay_group = {
            # NEP (Neptune) - Highest paying
            ((4, 4), "NEP"): 3.0,
            ((5, 5), "NEP"): 6.0,
            ((6, 7), "NEP"): 10.0,
            ((8, 9), "NEP"): 15.0,
            ((10, 11), "NEP"): 20.0,
            ((12, 14), "NEP"): 30.0,
            ((15, 17), "NEP"): 40.0,
            ((18, 20), "NEP"): 50.0,
            ((21, 23), "NEP"): 60.0,
            ((24, 25), "NEP"): 75.0,
            ((26, 30), "NEP"): 90.0,
            ((31, 40), "NEP"): 120.0,
            ((41, 50), "NEP"): 160.0,
            ((51, 64), "NEP"): 200.0,
            # URA (Uranus)
            ((4, 4), "URA"): 2.0,
            ((5, 5), "URA"): 4.0,
            ((6, 7), "URA"): 7.0,
            ((8, 9), "URA"): 10.0,
            ((10, 11), "URA"): 15.0,
            ((12, 14), "URA"): 20.0,
            ((15, 17), "URA"): 25.0,
            ((18, 20), "URA"): 30.0,
            ((21, 23), "URA"): 40.0,
            ((24, 25), "URA"): 50.0,
            ((26, 30), "URA"): 60.0,
            ((31, 40), "URA"): 80.0,
            ((41, 50), "URA"): 110.0,
            ((51, 64), "URA"): 150.0,
            # SAT (Saturn)
            ((4, 4), "SAT"): 1.5,
            ((5, 5), "SAT"): 3.0,
            ((6, 7), "SAT"): 5.0,
            ((8, 9), "SAT"): 7.5,
            ((10, 11), "SAT"): 10.0,
            ((12, 14), "SAT"): 15.0,
            ((15, 17), "SAT"): 20.0,
            ((18, 20), "SAT"): 25.0,
            ((21, 23), "SAT"): 30.0,
            ((24, 25), "SAT"): 40.0,
            ((26, 30), "SAT"): 50.0,
            ((31, 40), "SAT"): 65.0,
            ((41, 50), "SAT"): 85.0,
            ((51, 64), "SAT"): 120.0,
            # JUP (Jupiter)
            ((4, 4), "JUP"): 1.0,
            ((5, 5), "JUP"): 2.0,
            ((6, 7), "JUP"): 3.5,
            ((8, 9), "JUP"): 5.0,
            ((10, 11), "JUP"): 8.0,
            ((12, 14), "JUP"): 10.0,
            ((15, 17), "JUP"): 15.0,
            ((18, 20), "JUP"): 18.0,
            ((21, 23), "JUP"): 20.0,
            ((24, 25), "JUP"): 25.0,
            ((26, 30), "JUP"): 35.0,
            ((31, 40), "JUP"): 50.0,
            ((41, 50), "JUP"): 70.0,
            ((51, 64), "JUP"): 100.0,
            # MAR (Mars)
            ((4, 4), "MAR"): 0.8,
            ((5, 5), "MAR"): 1.5,
            ((6, 7), "MAR"): 2.5,
            ((8, 9), "MAR"): 4.0,
            ((10, 11), "MAR"): 6.0,
            ((12, 14), "MAR"): 8.0,
            ((15, 17), "MAR"): 10.0,
            ((18, 20), "MAR"): 12.0,
            ((21, 23), "MAR"): 15.0,
            ((24, 25), "MAR"): 20.0,
            ((26, 30), "MAR"): 28.0,
            ((31, 40), "MAR"): 40.0,
            ((41, 50), "MAR"): 55.0,
            ((51, 64), "MAR"): 75.0,
            # EAR (Earth)
            ((4, 4), "EAR"): 0.5,
            ((5, 5), "EAR"): 1.0,
            ((6, 7), "EAR"): 1.5,
            ((8, 9), "EAR"): 2.5,
            ((10, 11), "EAR"): 4.0,
            ((12, 14), "EAR"): 5.0,
            ((15, 17), "EAR"): 7.0,
            ((18, 20), "EAR"): 8.0,
            ((21, 23), "EAR"): 10.0,
            ((24, 25), "EAR"): 12.0,
            ((26, 30), "EAR"): 18.0,
            ((31, 40), "EAR"): 28.0,
            ((41, 50), "EAR"): 40.0,
            ((51, 64), "EAR"): 55.0,
            # VEN (Venus)
            ((4, 4), "VEN"): 0.3,
            ((5, 5), "VEN"): 0.6,
            ((6, 7), "VEN"): 1.0,
            ((8, 9), "VEN"): 2.0,
            ((10, 11), "VEN"): 3.0,
            ((12, 14), "VEN"): 4.0,
            ((15, 17), "VEN"): 5.0,
            ((18, 20), "VEN"): 6.0,
            ((21, 23), "VEN"): 8.0,
            ((24, 25), "VEN"): 10.0,
            ((26, 30), "VEN"): 15.0,
            ((31, 40), "VEN"): 22.0,
            ((41, 50), "VEN"): 32.0,
            ((51, 64), "VEN"): 45.0,
            # MER (Mercury)
            ((4, 4), "MER"): 0.2,
            ((5, 5), "MER"): 0.4,
            ((6, 7), "MER"): 0.8,
            ((8, 9), "MER"): 1.5,
            ((10, 11), "MER"): 2.0,
            ((12, 14), "MER"): 3.0,
            ((15, 17), "MER"): 4.0,
            ((18, 20), "MER"): 5.0,
            ((21, 23), "MER"): 6.0,
            ((24, 25), "MER"): 7.0,
            ((26, 30), "MER"): 10.0,
            ((31, 40), "MER"): 16.0,
            ((41, 50), "MER"): 24.0,
            ((51, 64), "MER"): 35.0,
            # PLU (Pluto) - Lowest paying
            ((4, 4), "PLU"): 0.1,
            ((5, 5), "PLU"): 0.2,
            ((6, 7), "PLU"): 0.5,
            ((8, 9), "PLU"): 1.0,
            ((10, 11), "PLU"): 1.5,
            ((12, 14), "PLU"): 2.0,
            ((15, 17), "PLU"): 2.5,
            ((18, 20), "PLU"): 3.0,
            ((21, 23), "PLU"): 3.5,
            ((24, 25), "PLU"): 4.0,
            ((26, 30), "PLU"): 6.0,
            ((31, 40), "PLU"): 10.0,
            ((41, 50), "PLU"): 16.0,
            ((51, 64), "PLU"): 25.0,
        }
        self.paytable = self.convert_range_table(pay_group)

        self.include_padding = True
        self.special_symbols = {"wild": ["MET", "MET2", "MET3", "MET4", "MET5", "MET6", "MET7", "MET8", "MET9", "MET10"], "scatter": ["SUN"]}

        # Free spin triggers:
        # 4 SUN = Cosmic Break Bonus (10 free spins)
        self.freespin_triggers = {
            self.basegame_type: {4: 10},
            self.freegame_type: {4: 5},
        }
        self.anticipation_triggers = {
            self.basegame_type: min(self.freespin_triggers[self.basegame_type].keys()) - 1,
            self.freegame_type: min(self.freespin_triggers[self.freegame_type].keys()) - 1,
        }

        self.maximum_board_mult = 512

        # ─── Bonus Type Configuration ────────────────────────────────────
        # Scatter count → bonus type mapping
        self.bonus_type_map = {4: "cosmicBreak"}

        # Cosmic Break Bonus config
        self.cosmic_break_initial_spins = 10
        self.cosmic_break_hits_to_unlock = 3
        self.cosmic_break_unlock_multiplier = 2  # +2x per corner unlocked
        self.cosmic_break_full_unlock_extra_spins = 5
        self.cosmic_break_corner_extra_spins = 2  # extra spins per individual corner unlock
        self.cosmic_break_corners = [
            {
                "id": "topLeft",
                "positions": [
                    (0, 0), (0, 1), (0, 2),
                    (1, 0), (1, 1), (1, 2),
                    (2, 0), (2, 1), (2, 2),
                ],
            },
            {
                "id": "topRight",
                "positions": [
                    (5, 0), (5, 1), (5, 2),
                    (6, 0), (6, 1), (6, 2),
                    (7, 0), (7, 1), (7, 2),
                ],
            },
            {
                "id": "bottomLeft",
                "positions": [
                    (0, 5), (0, 6), (0, 7),
                    (1, 5), (1, 6), (1, 7),
                    (2, 5), (2, 6), (2, 7),
                ],
            },
            {
                "id": "bottomRight",
                "positions": [
                    (5, 5), (5, 6), (5, 7),
                    (6, 5), (6, 6), (6, 7),
                    (7, 5), (7, 6), (7, 7),
                ],
            },
        ]

        # ─── Reel Strips ─────────────────────────────────────────────────
        reels = {
            "BR0": "BR0.csv",
            "FR0": "FR0.csv",
            "WCAP": "WCAP.csv",
            "MB0": "MB0.csv",
            "MB_WCAP": "MB_WCAP.csv",
        }
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(os.path.join(self.reels_path, f))

        # ─── Reel weights per bonus type (used during grid resize) ───────
        self.bonus_reel_weights = {
            "cosmicBreak": {"MB0": 1},
            "moonBreak_wincap": {"MB0": 1, "MB_WCAP": 5},
        }

        mode_maxwins = {"base": 5000, "bonus": 5000}

        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=mode_maxwins["base"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=mode_maxwins["base"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1, "WCAP": 5},
                            },
                            "scatter_triggers": {4: 1},
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    # Cosmic Break: 4 SUN → 8x8 grid, uses MB0 reel strip
                    Distribution(
                        criteria="freegame_cosmic_break",
                        quota=0.08,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"MB0": 1},
                            },
                            "scatter_triggers": {4: 1},
                            "force_wincap": False,
                            "force_freegame": True,
                            "force_bonus_type": "cosmicBreak",
                        },
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.4,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.519,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
            BetMode(
                name="bonus",
                cost=500,
                rtp=self.rtp,
                max_win=mode_maxwins["bonus"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="freegame_cosmic_break",
                        quota=1.0,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"MB0": 1},
                            },
                            "scatter_triggers": {4: 1},
                            "force_wincap": False,
                            "force_freegame": True,
                            "force_bonus_type": "cosmicBreak",
                        },
                    ),
                ],
            ),
        ]
