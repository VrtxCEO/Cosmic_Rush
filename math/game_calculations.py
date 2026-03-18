from collections import defaultdict

from src.executables.executables import Executables
from src.calculations.cluster import Cluster
from src.calculations.board import Board
from src.config.config import Config


class GameCalculations(Executables):
    """
    Override cluster evaluation to include grid position multipliers.
    Same mechanic as the cluster template — positions accumulate multipliers
    during free spins as wins land on them.
    """

    @staticmethod
    def _expand_cluster_shared_wilds(board, already_checked, local_checked, potential_cluster, reel, row, og_symbol, wild_key):
        """Recursively expand cluster. Wilds are NOT added to already_checked so they can belong to multiple clusters."""
        neighbours = Cluster.get_neighbours(board, reel, row, local_checked)
        for reel_, row_ in neighbours:
            if Cluster.in_cluster(board, reel_, row_, og_symbol, wild_key):
                potential_cluster.append((reel_, row_))
                if not board[reel_][row_].check_attribute(wild_key):
                    already_checked.append((reel_, row_))
                GameCalculations._expand_cluster_shared_wilds(
                    board, already_checked, local_checked, potential_cluster, reel_, row_, og_symbol, wild_key
                )

    @staticmethod
    def get_clusters_shared_wilds(board, wild_key: str = "wild") -> dict:
        """Get clusters allowing a single wild to contribute to multiple adjacent clusters simultaneously."""
        already_checked = []
        clusters = defaultdict(list)
        for reel in range(len(board)):
            for row in range(len(board[reel])):
                if board[reel][row].check_attribute("locked"):
                    already_checked.append((reel, row))
                    continue
                if (reel, row) not in already_checked and not board[reel][row].check_attribute(wild_key):
                    potential_cluster = [(reel, row)]
                    already_checked.append((reel, row))
                    local_checked = [(reel, row)]
                    symbol = board[reel][row].name
                    GameCalculations._expand_cluster_shared_wilds(
                        board, already_checked, local_checked, potential_cluster, reel, row, symbol, wild_key
                    )
                    clusters[symbol].append(potential_cluster)
        return clusters

    def evaluate_clusters_with_grid(
        self,
        config: Config,
        board: Board,
        clusters: dict,
        pos_mult_grid: list,
        global_multiplier: int = 1,
        return_data: dict = {"totalWin": 0, "wins": []},
    ) -> type:
        """
        Determine payout amount from cluster, including position multipliers and global multiplier.
        """
        exploding_symbols = []
        total_win = 0
        for sym in clusters:
            for cluster in clusters[sym]:
                syms_in_cluster = len(cluster)
                if (syms_in_cluster, sym) in config.paytable:
                    board_mult = 0
                    for positions in cluster:
                        board_mult += pos_mult_grid[positions[0]][positions[1]]
                    board_mult = max(board_mult, 1)
                    sym_win = config.paytable[(syms_in_cluster, sym)]
                    symwin_mult = sym_win * board_mult * global_multiplier
                    total_win += symwin_mult
                    json_positions = [{"reel": p[0], "row": p[1]} for p in cluster]

                    central_pos = Cluster.get_central_cluster_position(json_positions)
                    return_data["wins"] += [
                        {
                            "symbol": sym,
                            "clusterSize": syms_in_cluster,
                            "win": symwin_mult,
                            "positions": json_positions,
                            "meta": {
                                "globalMult": global_multiplier,
                                "clusterMult": board_mult,
                                "winWithoutMult": sym_win,
                                "overlay": {"reel": central_pos[0], "row": central_pos[1]},
                            },
                        }
                    ]

                    for positions in cluster:
                        board[positions[0]][positions[1]].explode = True
                        if {
                            "reel": positions[0],
                            "row": positions[1],
                        } not in exploding_symbols:
                            exploding_symbols.append({"reel": positions[0], "row": positions[1]})

        return_data["totalWin"] += total_win

        return board, return_data
