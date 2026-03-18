from copy import deepcopy

APPLY_TUMBLE_MULTIPLIER = "applyMultiplierToTumble"
UPDATE_GRID = "updateGrid"

# ─── Shared Events ───────────────────────────────────────────────


def update_grid_mult_event(gamestate):
    """Pass updated position multipliers after a win."""
    event = {
        "index": len(gamestate.book.events),
        "type": UPDATE_GRID,
        "gridMultipliers": deepcopy(gamestate.position_multipliers),
    }
    gamestate.book.add_event(event)


def freespin_trigger_bonus_event(gamestate, bonus_type, scatter_count, positions=None):
    """Extended freespin trigger event including bonusType."""
    event = {
        "index": len(gamestate.book.events),
        "type": "freeSpinTrigger",
        "bonusType": bonus_type,
        "totalFs": gamestate.tot_fs,
        "positions": positions or [],
    }
    gamestate.book.add_event(event)


# ─── Meteor Multiplier Event ─────────────────────────────────────


def meteor_land_event(gamestate, meteors, new_global_multiplier):
    """MET symbols landed during Cosmic Break — their multipliers absorbed into global."""
    event = {
        "index": len(gamestate.book.events),
        "type": "meteorLand",
        "meteors": meteors,
        "newGlobalMultiplier": new_global_multiplier,
    }
    gamestate.book.add_event(event)


# ─── Cosmic Break Bonus Events ─────────────────────────────────────


def _format_corners(gamestate, corners):
    """Convert internal corner dicts to frontend CornerState format."""
    return [
        {
            "id": c["id"],
            "hitsRequired": gamestate.config.cosmic_break_hits_to_unlock,
            "hitsReceived": c["hits"],
            "unlocked": c["unlocked"],
        }
        for c in corners
    ]


def cosmic_break_init_event(gamestate, corners):
    """Initialize Cosmic Break corner zones."""
    event = {
        "index": len(gamestate.book.events),
        "type": "cosmicBreakInit",
        "gridSize": 8,
        "corners": _format_corners(gamestate, corners),
    }
    gamestate.book.add_event(event)


def cosmic_break_corner_update_event(gamestate, corners, newly_unlocked, current_multiplier, extra_spins_added=0):
    """Corner progress updated after hits."""
    event = {
        "index": len(gamestate.book.events),
        "type": "cosmicBreakCornerUpdate",
        "corners": _format_corners(gamestate, corners),
        "newlyUnlocked": newly_unlocked,
        "currentMultiplier": current_multiplier,
        "extraSpinsAdded": extra_spins_added,
    }
    gamestate.book.add_event(event)


def cosmic_break_full_unlock_event(gamestate, extra_spins):
    """All 4 corners unlocked — award extra spins."""
    event = {
        "index": len(gamestate.book.events),
        "type": "cosmicBreakFullUnlock",
        "extraSpins": extra_spins,
    }
    gamestate.book.add_event(event)

