#!/usr/bin/env python3
"""
Wedding guest-list export — pulls RSVPs from the Google Sheet and writes
the master guest list CSV (WithJoy-style tracking).

The RSVP sheet is the source of truth (every RSVP appends a row). This
script downloads it and produces the universal 9-column tracking CSV that
can be imported into Butter/Mailchimp/Gmail or opened in Sheets/Excel.

Usage:
  python3 export_guest_list.py --spreadsheet-id <ID> [--out guest-list.csv]

Requires:
  pip install gspread oauth2client   (or use the exported Google Sheet CSV
  directly: File > Download > CSV and skip this script)

Alternatively — no-code path:
  Open the spreadsheet in Google Sheets → File → Download → Comma-separated
  values (.csv) → that IS your guest list. Use it with the Butter import.
"""

import argparse
import csv
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spreadsheet-id", required=True)
    ap.add_argument("--out", default="guest-list.csv")
    args = ap.parse_args()

    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        sys.exit(
            "Missing deps. Run: pip install gspread google-auth\n\n"
            "OR use the no-code path: Sheets > File > Download > CSV."
        )

    scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    creds = Credentials.from_service_account_file("service-account.json", scopes=scopes)
    gc = gspread.authorize(creds)
    sh = gc.open_by_key(args.spreadsheet_id)
    ws = sh.worksheet("RSVPs")
    rows = ws.get_all_values()

    if not rows:
        sys.exit("No rows found in the RSVPs sheet.")
    header = rows[0]
    data = rows[1:]

    # Universal 9-column output (matches guest-list-template.csv)
    out_header = [
        "First Name", "Last Name", "Email", "Party Size",
        "Guest Group", "RSVP Status", "Meal Preference", "Song Request", "Notes"
    ]

    def split_name(name):
        parts = (name or "").strip().split(" ", 1)
        return (parts[0], parts[1] if len(parts) > 1 else "")

    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(out_header)
        for row in data:
            # Row: Timestamp, Name, Email, Attending, Guests, Meal, Song, Notes
            ts = row[0] if len(row) > 0 else ""
            name = row[1] if len(row) > 1 else ""
            email = row[2] if len(row) > 2 else ""
            attending = row[3] if len(row) > 3 else ""
            guests = row[4] if len(row) > 4 else ""
            meal = row[5] if len(row) > 5 else ""
            song = row[6] if len(row) > 6 else ""
            notes = row[7] if len(row) > 7 else ""
            first, last = split_name(name)
            status = "Accepted" if attending == "yes" else ("Declined" if attending == "no" else "Pending")
            w.writerow([first, last, email, guests, "", status, meal, song, notes])

    print(f"Wrote {len(data)} RSVPs to {args.out}")
    print("Import into Butter/Mailchimp/Gmail or open in Sheets/Excel.")


if __name__ == "__main__":
    main()
