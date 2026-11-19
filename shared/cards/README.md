# shared/cards

The three 1000×750 portfolio cards per piece: cover, evidence, instrument.

## Rules

- Render from HTML at device scale 2, downscale to exactly 1000×750.
- Crop by recorded box coordinates, not by eye.
- Each card states its own limit in its own footer.
- No stock art, no invented values, no text-heavy screenshots.
- The same cards are reused for the site and the Upwork/Fiverr packets.

## Provenance

- `docs/images/portfolio/README.md` records the source, the crop boxes and the arithmetic.
- A re-run of the renderer reproduces the set.
- Cards are committed with the repo.

## Acceptance

- Three files per piece, exactly 1000×750.
- Each limit is readable at card size.
- The renderer is committed and documented.
- The cards match the current UI and evidence.
