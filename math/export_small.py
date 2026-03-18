"""Generate a small set of books for the frontend mock RGS."""
import sys, os, json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from gamestate import GameState
from game_config import GameConfig
from src.state.run_sims import create_books

if __name__ == "__main__":
    c = GameConfig()
    gs = GameState(c)

    print("Running 500 base + 500 bonus sims...")
    num_sim_args = {"base": 500, "bonus": 500}
    create_books(gs, c, num_sim_args, 500, 1, False, False)
    print("Done!")

    lib = os.path.join(os.path.dirname(__file__), "library", "books")
    out_base = 'C:/Users/dpatt/Desktop/SlotMachine-Design-Pipeline/engines/web-sdk/apps/star-gazing/static/books_base.json'
    out_bonus = 'C:/Users/dpatt/Desktop/SlotMachine-Design-Pipeline/engines/web-sdk/apps/star-gazing/static/books_bonus.json'

    base = json.load(open(os.path.join(lib, "books_base.json")))
    bonus = json.load(open(os.path.join(lib, "books_bonus.json")))

    # Categorize base books
    counts = {"cosmicBreak": 0, "standardFS": 0, "noFS": 0}
    for b in base:
        types = {e["type"] for e in b["events"]}
        if "cosmicBreakInit" in types:
            counts["cosmicBreak"] += 1
        elif "freeSpinTrigger" in types:
            counts["standardFS"] += 1
        else:
            counts["noFS"] += 1

    print(f"Base books: {len(base)} - {counts}")
    print(f"Bonus books: {len(bonus)}")

    for i, b in enumerate(base):
        b['id'] = i
    for i, b in enumerate(bonus):
        b['id'] = i

    with open(out_base, 'w') as f:
        json.dump(base, f)
    with open(out_bonus, 'w') as f:
        json.dump(bonus, f)

    print(f"Exported base  -> {os.path.getsize(out_base):,} bytes")
    print(f"Exported bonus -> {os.path.getsize(out_bonus):,} bytes")
