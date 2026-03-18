"""Generate books for the Star Gazing frontend mock RGS."""
import sys
import os
import json
import glob

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from gamestate import GameState
from game_config import GameConfig
from src.state.run_sims import create_books

if __name__ == "__main__":
    c = GameConfig()
    gs = GameState(c)

    print("Running 100k base + 100k bonus simulations...")
    num_sim_args = {"base": int(1e5), "bonus": int(1e5)}
    batch_size = 50000
    threads = 10
    compress = False
    profiling = False

    create_books(gs, c, num_sim_args, batch_size, threads, compress, profiling)
    print("Simulation complete!")

    # Find generated books and export for frontend
    books_dir = os.path.join(os.path.dirname(__file__), "library", "books")
    if not os.path.exists(books_dir):
        print(f"Books directory not found at {books_dir}")
        # Try finding where books were saved
        for root, dirs, files in os.walk(os.path.dirname(__file__)):
            for f in files:
                if "book" in f.lower() and f.endswith(".json"):
                    print(f"Found: {os.path.join(root, f)}")
    else:
        print(f"Books saved to: {books_dir}")
        for f in os.listdir(books_dir):
            fp = os.path.join(books_dir, f)
            size = os.path.getsize(fp)
            print(f"  {f}: {size:,} bytes")
