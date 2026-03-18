"""Diagnose cascaded scatter issue in exported books.

Scans books_base.json for books where:
1. SUNs (scatters) cascade in during tumbles to reach 3+ total
2. But no freeSpinTrigger event exists

Also checks: do any exported books have 3+ visible SUNs at any point?
"""

import json

BOOKS_PATH = "library/books/books_base.json"


def count_suns_on_board(board):
    """Count SUN symbols on a board (list of reels, each reel is list of symbols)."""
    count = 0
    positions = []
    for reel_idx, reel in enumerate(board):
        for row_idx, sym in enumerate(reel):
            name = sym if isinstance(sym, str) else sym.get("name", "")
            if name == "SUN":
                count += 1
                positions.append((reel_idx, row_idx))
    return count, positions


def analyze_book(book_idx, book):
    """Analyze a single book for cascaded scatter issues."""
    events = book.get("events", [])

    has_trigger = False
    max_suns = 0
    max_suns_event = None
    initial_suns = 0

    for event in events:
        etype = event.get("type", "")

        if etype == "freeSpinTrigger":
            has_trigger = True

        # Check reveal event (initial board)
        if etype == "reveal":
            board = event.get("board", [])
            if board:
                suns, positions = count_suns_on_board(board)
                initial_suns = suns
                if suns > max_suns:
                    max_suns = suns
                    max_suns_event = "reveal"

        # Check tumbleBoard events (cascade boards)
        if etype == "tumbleBoard":
            board = event.get("board", [])
            if board:
                suns, positions = count_suns_on_board(board)
                if suns > max_suns:
                    max_suns = suns
                    max_suns_event = "tumbleBoard"

    return {
        "book_idx": book_idx,
        "has_trigger": has_trigger,
        "initial_suns": initial_suns,
        "max_suns": max_suns,
        "max_suns_event": max_suns_event,
        "cascaded": max_suns > initial_suns,
    }


def main():
    with open(BOOKS_PATH, "r") as f:
        data = json.load(f)

    all_books = data  # flat list
    print(f"Total books: {len(all_books)}")

    # Separate by criteria
    non_bonus = [b for b in all_books if b.get("criteria") in ("basegame", "0")]
    bonus = [b for b in all_books if b.get("criteria") not in ("basegame", "0")]
    print(f"Non-bonus books (basegame/0): {len(non_bonus)}")
    print(f"Bonus books: {len(bonus)}")
    print()

    # Analyze non-bonus books for cascaded scatter issues
    problem_books = []
    cascaded_scatter_books = []

    for i, book in enumerate(non_bonus):
        result = analyze_book(i, book)
        result["criteria"] = book.get("criteria", "?")

        if result["max_suns"] >= 3 and not result["has_trigger"]:
            problem_books.append(result)

        if result["cascaded"] and result["max_suns"] >= 3:
            cascaded_scatter_books.append(result)

    print("=== NON-BONUS BOOKS: 3+ SUNs without freeSpinTrigger ===")
    if problem_books:
        for pb in problem_books:
            print(f"  Book {pb['book_idx']} ({pb['criteria']}): initial={pb['initial_suns']}, max={pb['max_suns']} (from {pb['max_suns_event']}), cascaded={pb['cascaded']}")
    else:
        print("  None found - repeat mechanism is working correctly")

    print()
    print("=== NON-BONUS BOOKS: SUNs cascaded to 3+ during tumbles ===")
    if cascaded_scatter_books:
        for cb in cascaded_scatter_books:
            triggered = "YES" if cb["has_trigger"] else "NO"
            print(f"  Book {cb['book_idx']} ({cb['criteria']}): initial={cb['initial_suns']} -> max={cb['max_suns']}, trigger={triggered}")
    else:
        print("  None found - no cascaded scatter accumulation to 3+")

    # Check bonus books
    print()
    print("=== BONUS BOOKS: checking scatter counts ===")
    bonus_no_trigger = []
    for i, book in enumerate(bonus):
        result = analyze_book(i, book)
        result["criteria"] = book.get("criteria", "?")
        if result["max_suns"] >= 3 and not result["has_trigger"]:
            bonus_no_trigger.append(result)

    if bonus_no_trigger:
        for pb in bonus_no_trigger:
            print(f"  Bonus book {pb['book_idx']} ({pb['criteria']}): initial={pb['initial_suns']}, max={pb['max_suns']}, no trigger!")
    else:
        print("  All bonus books with 3+ SUNs have freeSpinTrigger - OK")

    # Check for empty positions in freeSpinTrigger events
    print()
    print("=== freeSpinTrigger events with empty positions ===")
    for i, book in enumerate(all_books):
        criteria = book.get("criteria", "?")
        for event in book.get("events", []):
            if event.get("type") == "freeSpinTrigger":
                positions = event.get("positions", [])
                if len(positions) == 0:
                    print(f"  Book {i} ({criteria}): empty positions in freeSpinTrigger")

    # Overall stats
    print()
    print("=== SUN distribution in non-bonus books ===")
    sun_dist = {}
    for i, book in enumerate(non_bonus):
        result = analyze_book(i, book)
        key = f"initial={result['initial_suns']}, max={result['max_suns']}"
        sun_dist[key] = sun_dist.get(key, 0) + 1
    for k, v in sorted(sun_dist.items()):
        print(f"  {k}: {v} books")


if __name__ == "__main__":
    main()
