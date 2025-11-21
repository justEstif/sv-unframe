# Unframe Challenge Scraper

Web scraper for collecting historical propaganda materials from public domain sources to build the Unframe challenge database.

## Overview

This scraper collects historical propaganda materials featuring specific persuasion techniques from **4 public domain sources**:

- **Library of Congress** - WWI/WWII posters, historical photographs
- **Internet Archive** - Vintage ads, safety campaigns, health warnings
- **Wikimedia Commons** - War propaganda, public domain posters
- **Prelinger Archives** - Safety films, educational scare tactics

Each scraped item includes:
- High-resolution image
- Historical metadata (title, date, source)
- Structured JSON data ready for database import

## Installation

No additional dependencies needed! The script uses:
- Native Node.js `fetch` API
- Native `fs` and `stream` modules

All sources work without authentication.

## Usage

### Basic Usage

Run the scraper from the project root:

```bash
npx tsx scripts/scrape-challenges.ts
```

### Dry Run Mode

Preview what the scraper will find without downloading files:

```bash
npx tsx scripts/scrape-challenges.ts --dry-run
```

This is useful for:
- Testing API queries
- Previewing results before downloading
- Checking if you'll get good results

## Output Structure

The scraper creates the following structure:

```
lib/assets/
├── challenges/           # JSON files (one per challenge)
│   ├── fear-001.json
│   ├── fear-002.json
│   └── ...
└── images/              # Downloaded images
    ├── fear-001.jpg
    ├── fear-002.jpg
    └── ...
```

### JSON Format

Each challenge JSON file follows this structure:

```json
{
  "id": "fear-001",
  "title": "Buy war bonds",
  "source": "Library of Congress",
  "sourceUrl": "http://www.loc.gov/item/2018662891/",
  "imageUrl": "https://tile.loc.gov/...",
  "imageFilename": "fear-001.jpg",
  "era": "1942-01-01",
  "historicalContext": "[NEEDS REVIEW] Poster shows Uncle Sam...",
  "primaryTechnique": "fear-appeal",
  "allTechniques": ["fear-appeal"],
  "difficulty": "medium",
  "explanation": "[NEEDS REVIEW] This piece uses fear appeals...",
  "correctAnswers": ["fear-appeal"]
}
```

## Data Sources & APIs

### 1. Library of Congress (LOC)
- **API:** https://www.loc.gov/apis/json-and-yaml/
- **Auth:** None required
- **Rate Limit:** Informal (be respectful)
- **Best for:** WWI/WWII propaganda posters, historical photographs
- **Target:** ~10 items per run

### 2. Internet Archive (IA)
- **API:** https://archive.org/advancedsearch.php
- **Auth:** None required
- **Rate Limit:** Informal
- **Best for:** Vintage advertisements, safety campaigns
- **Target:** ~5 items per run

### 3. Wikimedia Commons
- **API:** https://commons.wikimedia.org/w/api.php (MediaWiki API)
- **Auth:** None required
- **Rate Limit:** Informal (add User-Agent header)
- **Best for:** Categorized propaganda posters, well-documented images
- **Search Method:** Category-based (e.g., `Category:World_War_II_propaganda_posters`)
- **Target:** ~10 items per run

### 4. Prelinger Archives (via Internet Archive)
- **API:** https://archive.org/advancedsearch.php with `collection:prelinger` filter
- **Auth:** None required
- **Rate Limit:** Informal
- **Best for:** Safety/educational films, fear-based public health campaigns
- **Content Type:** Videos (thumbnails extracted)
- **Era:** 1920s-1960s industrial safety, civil defense, health warnings
- **Target:** ~8 items per run

### API Rate Limits Summary

| Source | Auth Required | Rate Limit | Notes |
|--------|--------------|------------|-------|
| Library of Congress | ❌ No | Informal | Be respectful, ~2s delays |
| Internet Archive | ❌ No | Informal | Shared with Prelinger |
| Wikimedia Commons | ❌ No | Informal | Add User-Agent header |
| Prelinger Archives | ❌ No | Informal | Same as Internet Archive |

## Post-Scraping Review

After running the scraper, you need to manually review and enhance the generated JSON files:

### 1. Historical Context
Replace `[NEEDS REVIEW]` placeholders with proper historical context:

```json
"historicalContext": "Created in 1942 during WWII, this poster was part of the U.S. Treasury Department's campaign to encourage citizens to purchase war bonds. The imagery of troops in combat was meant to create a sense of urgency and personal responsibility."
```

### 2. Technique Tags
Add additional persuasion techniques if present:

```json
"allTechniques": ["fear-appeal", "patriotism", "authority-figure"]
```

### 3. Explanations
Write clear explanations of how the techniques work:

```json
"explanation": "This poster employs fear appeals by showing soldiers in active combat, creating anxiety about the war outcome. It then channels that fear into action (buying bonds) as a way for civilians to 'help' and reduce their anxiety. The presence of Uncle Sam adds authority and patriotic obligation."
```

### 4. Difficulty Assessment
Adjust difficulty based on:
- **Easy**: Single obvious technique, clear messaging
- **Medium**: Multiple techniques, requires some analysis
- **Hard**: Subtle techniques, complex messaging, requires deep understanding

## Configuration

Edit the `CONFIG` object in `scrape-challenges.ts` to customize:

```typescript
const CONFIG = {
  technique: 'fear-appeal',           // Technique ID
  techniqueName: 'Fear Appeals',      // Display name
  targetCount: 15,                    // Target number of challenges
  rateLimit: 2000,                    // ms between requests
};
```

## Adding New Techniques

To scrape a different technique:

1. Update the `CONFIG` object with the new technique:
   ```typescript
   technique: 'false-authority',
   techniqueName: 'False Authority',
   ```

2. Update search queries in the scraper functions:
   ```typescript
   const searches = [
     'doctor tobacco advertisement',
     'celebrity endorsement vintage',
     'expert testimonial poster',
   ];
   ```

3. Run the scraper:
   ```bash
   npx tsx scripts/scrape-challenges.ts
   ```

## Troubleshooting

### Images not downloading
- Check network connection
- Some LOC images are low-resolution thumbnails (check `imageUrl` field)
- Internet Archive may have different image URL patterns
- Wikimedia Commons images may be very large (several MB)
- Tobacco docs may fail if Bates number is incorrect

### No results from specific sources

**Internet Archive / Prelinger:**
- IA search API can be inconsistent
- Try different search terms
- Collection filters may be too restrictive

**Wikimedia Commons:**
- Category names are case-sensitive
- Some categories may be empty
- Check if category exists: https://commons.wikimedia.org/wiki/Category:NAME


### Rate limiting errors
- Increase `rateLimit` value in CONFIG (default: 2000ms)
- Add longer delays between batches

## Source-Specific Notes

### Wikimedia Commons
- Uses category-based search for better results
- Excellent metadata via `extmetadata` field
- High resolution images, often several MB per image
- Tip: Use structured categories like `Category:World_War_II_propaganda_posters`

### Prelinger Archives
- Content is videos, not static images
- Thumbnail service extracts video frames
- Subject matter: Educational, industrial, civil defense films
- Peak content from 1940s-1960s
- Tip: Excellent for fear-based safety and health campaigns

## Next Steps

After scraping and reviewing challenges:

1. **Extend Database Schema** - Add `challenges` and `techniques` tables to `src/lib/db/schema.ts`
2. **Import Script** - Create a script to import JSON files into the database
3. **Build Challenge UI** - Create Svelte components to display challenges
4. **Implement Scoring** - Track user attempts and calculate accuracy

## Example Workflow

```bash
# 1. Run dry run to preview
npx tsx scripts/scrape-challenges.ts --dry-run

# 2. Run actual scrape
npx tsx scripts/scrape-challenges.ts

# 3. Review and edit JSON files in lib/assets/challenges/

# 4. Verify images in lib/assets/images/

# 5. Create database import script (next step!)
```

## Contributing

When adding new scrapers for additional sources:

1. Create a new function (e.g., `scrapeNewSource()`)
2. Return `ChallengeData[]` array
3. Add source name to `ChallengeData` interface type union
4. Add to the `allChallenges` array in `main()`
5. Export the function at bottom of file
6. Update this README with source-specific notes
7. Add API documentation and troubleshooting tips

## License

Scraped content is from public domain sources. Always verify licensing and attribution requirements for each source.
