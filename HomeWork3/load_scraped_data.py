import json
import re
import os
import psycopg2
from psycopg2.extras import execute_values



DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "postgres",
    "user":     "postgres",
    "password": "dodo2003",
}



HOTELS = [
    {
        "search_name":   "Deep Blue",
        "reviews_file":  "json/deep_blue.json",
        "full_file":     "json/deep_blue_full.json",
    },
    {
        "search_name":  "Wattle Grove Motel",
        "reviews_file": "json/wattle_grove.json",
        "full_file":    "json/wattle_grove_full.json",
    },
    {
        "search_name":  "Charlestown Executive",
        "reviews_file": "json/charlestown.json",
        "full_file":    "json/charlestown_full.json",
    },
    {
        "search_name":  "Cradle Mt",
        "reviews_file": "json/discovery_cradle_mt.json",
        "full_file":    "json/discovery_cradle_mt_full.json",
    },
    {
        "search_name":  "Discovery Parks - Robe",
        "reviews_file": "json/discovery_robe.json",
        "full_file":    "json/discovery_robe_full.json",
    },
    {
        "search_name":  "Gidgee",
        "reviews_file": "json/gidgee.json",
        "full_file":    "json/gidgee_full.json",
    },
    {
        "search_name":  "Hobart City",
        "reviews_file": "json/hobart_city.json",
        "full_file":    "json/hobart_city_full.json",
    },
    {
        "search_name":  "Honeysuckle",
        "reviews_file": "json/honeysuckle.json",
        "full_file":    "json/honeysuckle_full.json",
    },
    {
        "search_name":  "Quest Macquarie",
        "reviews_file": "json/quest_macquerie.json",
        "full_file":    "json/quest_macquerie_full.json",
    },
    {
        "search_name":  "Quest Midland",
        "reviews_file": "json/quest_midland.json",
        "full_file":    "json/quest_midland_full.json",
    },
]

# Price category names in ascending order
PRICE_CATEGORIES = ["Budget", "Standard", "Superior", "Deluxe", "Suite"]

# Mapping from TripAdvisor uppercase trip types to our CHECK constraint values
TRIP_TYPE_MAP = {
    "BUSINESS": "Business",
    "COUPLES":  "Couples",
    "FAMILY":   "Family",
    "SOLO":     "Solo",
    "FRIENDS":  "Friends",
}



def parse_price_range(price_range_str: str) -> tuple[float, float] | None:
    """
    Parse "$121 - $357" → (121.0, 357.0)
    Returns None if the string cannot be parsed.
    """
    if not price_range_str:
        return None
    matches = re.findall(r"\$?([\d,]+)", price_range_str)
    if len(matches) >= 2:
        low  = float(matches[0].replace(",", ""))
        high = float(matches[1].replace(",", ""))
        return low, high
    return None


def derive_price_offers(global_property_id: int, price_range_str: str, offer_id_start: int) -> list[tuple]:
    parsed = parse_price_range(price_range_str)
    if not parsed:
        print(f"  Warning: Could not parse price range '{price_range_str}' — skipping PriceOffers")
        return []

    low, high = parsed
    price_range = high - low
    offers = []

    for i, category in enumerate(PRICE_CATEGORIES):
        if len(PRICE_CATEGORIES) > 1:
            fraction = i / (len(PRICE_CATEGORIES) - 1)
        else:
            fraction = 0
        price = round(low + fraction * price_range, 2)

        offers.append((
            offer_id_start + i,     # OfferID
            global_property_id,     # GlobalPropertyID
            category,               # Category
            price,                  # PricePerNight
            "USD",                  # Currency
            None,                   # Description
            True,                   # IsAvailable
        ))

    return offers


def extract_reviews(reviews_data: list, global_property_id: int, review_id_start: int) -> list[tuple]:
    rows = []

    for i, r in enumerate(reviews_data):
        try:
            # ── Reviewer name ─────────────────────────────────────────
            user_profile = r.get("userProfile") or {}
            reviewer_name = (
                user_profile.get("displayName") or
                r.get("username") or
                "Anonymous"
            )[:100]

            # ── Title and content ─────────────────────────────────────
            review_title   = (r.get("title") or "")[:255] or None
            review_content = r.get("text") or None

            # Skip reviews with no content
            if not review_content:
                print(f"    Skipping review {i+1} — no content")
                continue

            # ── Date ──────────────────────────────────────────────────
            review_date = r.get("publishedDate") or r.get("createdDate")
            if not review_date:
                from datetime import date
                review_date = date.today().isoformat()

            # ── Overall rating ────────────────────────────────────────
            overall_rating = float(r.get("rating") or 3.0)
            overall_rating = min(max(overall_rating, 1.0), 5.0)

            # ── Subcategory ratings from additionalRatings array ──────
            sub = {
                "Location":     None,
                "Rooms":        None,
                "Value":        None,
                "Cleanliness":  None,
                "Service":      None,
                "Sleep Quality": None,
            }
            for entry in r.get("additionalRatings") or []:
                label = entry.get("ratingLabel")
                value = entry.get("rating")
                if label in sub and value is not None:
                    sub[label] = float(value)

            # ── Trip type ─────────────────────────────────────────────
            trip_info = r.get("tripInfo") or {}
            raw_trip  = trip_info.get("tripType") or ""
            trip_type = TRIP_TYPE_MAP.get(raw_trip.upper(), None)

            rows.append((
                review_id_start + i,        # ReviewID
                global_property_id,          # GlobalPropertyID
                reviewer_name,               # ReviewerName
                review_title,                # ReviewTitle
                review_content,              # ReviewContent
                review_date,                 # ReviewDate
                overall_rating,              # OverallRating
                sub["Location"],             # Location
                sub["Rooms"],                # Rooms
                sub["Value"],                # Value
                sub["Cleanliness"],          # Cleanliness
                sub["Service"],              # Service
                sub["Sleep Quality"],        # SleepQuality
                trip_type,                   # TripType
                "TripAdvisor",               # Source
            ))

        except Exception as e:
            print(f"    Warning: Skipped review {i+1} due to error: {e}")
            continue

    return rows



def get_global_property_id(cur, search_name: str) -> int | None:
    cur.execute(
        """
        SELECT "globalpropertyid", "globalpropertyname"
        FROM hotels
        WHERE "globalpropertyname" ILIKE %s
        LIMIT 1
        """,
        (f"%{search_name}%",)
    )
    row = cur.fetchone()
    if row:
        print(f"  Matched hotel: '{row[1]}' (ID: {row[0]})")
        return row[0]
    print(f"  Warning: No hotel found matching '{search_name}'")
    return None


def get_next_review_id(cur) -> int:
    """Get the next available ReviewID."""
    cur.execute("SELECT COALESCE(MAX(reviewid), 0) + 1 FROM reviews")
    return cur.fetchone()[0]


def get_next_offer_id(cur) -> int:
    """Get the next available OfferID."""
    cur.execute("SELECT COALESCE(MAX(offerid), 0) + 1 FROM priceoffers")
    return cur.fetchone()[0]


def hotel_already_has_offers(cur, global_property_id: int) -> bool:
    """Check if PriceOffers already exist for this hotel."""
    cur.execute(
        "SELECT COUNT(*) FROM priceoffers WHERE globalpropertyid = %s",
        (global_property_id,)
    )
    return cur.fetchone()[0] > 0


def insert_reviews(cur, rows: list[tuple]):
    if not rows:
        return
    execute_values(
        cur,
        """
        INSERT INTO Reviews (
            ReviewID, GlobalPropertyID, ReviewerName, ReviewTitle,
            ReviewContent, ReviewDate, OverallRating,
            Location, Rooms, Value, Cleanliness, Service, SleepQuality,
            TripType, Source
        ) VALUES %s
        """,
        rows
    )


def insert_price_offers(cur, rows: list[tuple]):
    if not rows:
        return
    execute_values(
        cur,
        """
        INSERT INTO PriceOffers (
            OfferID, GlobalPropertyID, Category,
            PricePerNight, Currency, Description, IsAvailable
        ) VALUES %s
        """,
        rows
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cur = conn.cursor()
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    total_reviews_inserted = 0
    total_offers_inserted  = 0

    try:
        for hotel in HOTELS:
            print(f"\n{'='*60}")
            print(f"Processing: {hotel['search_name']}")
            print(f"{'='*60}")

            # ── Load JSON files ───────────────────────────────────────
            if not os.path.exists(hotel["reviews_file"]):
                print(f"  Error: Reviews file not found: {hotel['reviews_file']}")
                continue
            if not os.path.exists(hotel["full_file"]):
                print(f"  Error: Full file not found: {hotel['full_file']}")
                continue

            with open(hotel["reviews_file"], encoding="utf-8") as f:
                reviews_data = json.load(f)
            with open(hotel["full_file"], encoding="utf-8") as f:
                full_data = json.load(f)

            # Handle both single object and list
            full = full_data[0] if isinstance(full_data, list) else full_data

            # ── Match hotel to DB ─────────────────────────────────────
            global_property_id = get_global_property_id(cur, hotel["search_name"])
            if not global_property_id:
                continue

            # ── Reviews ───────────────────────────────────────────────
            review_id_start = get_next_review_id(cur)
            review_rows     = extract_reviews(reviews_data, global_property_id, review_id_start)

            if review_rows:
                insert_reviews(cur, review_rows)
                print(f"  Inserted {len(review_rows)} reviews.")
                total_reviews_inserted += len(review_rows)
            else:
                print("  No reviews to insert.")

            # ── PriceOffers ───────────────────────────────────────────
            if hotel_already_has_offers(cur, global_property_id):
                print("  PriceOffers already exist for this hotel — skipping.")
            else:
                offer_id_start = get_next_offer_id(cur)
                price_range    = full.get("priceRange") or ""
                offer_rows     = derive_price_offers(global_property_id, price_range, offer_id_start)

                if offer_rows:
                    insert_price_offers(cur, offer_rows)
                    print(f"  Inserted {len(offer_rows)} price offers:")
                    for row in offer_rows:
                        print(f"    {row[2]:<12} → ${row[3]:.2f}")
                    total_offers_inserted += len(offer_rows)

        # ── Commit everything ─────────────────────────────────────────
        conn.commit()
        print(f"\n{'='*60}")
        print(f"Done! Committed successfully.")
        print(f"Total reviews inserted  : {total_reviews_inserted}")
        print(f"Total offers inserted   : {total_offers_inserted}")

    except Exception as e:
        conn.rollback()
        print(f"\nError — transaction rolled back: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()