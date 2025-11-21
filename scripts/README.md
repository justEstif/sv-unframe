# Unframe Challenge Scraper

Web scraper for collecting historical propaganda materials from public domain sources to build the Unframe challenge database.

## Overview

This scraper collects historical propaganda materials featuring specific persuasion techniques from:

- **Library of Congress** - WWI/WWII posters, historical photographs
- **Internet Archive** - Vintage ads, safety campaigns, health warnings

Each scraped item includes:

- High-resolution image
- Historical metadata (title, date, source)
- Structured JSON data ready for database import

## Installation

No additional dependencies needed! The script uses:

- Native Node.js `fetch` API
- Native `fs` and `stream` modules

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
  technique: "fear-appeal", // Technique ID
  techniqueName: "Fear Appeals", // Display name
  targetCount: 15, // Target number of challenges
  rateLimit: 2000, // ms between requests
};
```

## Adding New Techniques

To scrape a different technique:

1. Update the `CONFIG` object with the new technique:

   ```typescript
   technique: 'false-authority',
   techniqueName: 'False Authority',
   ```

2. Update search queries in `scrapeLOC()` and `scrapeInternetArchive()`:

   ```typescript
   const searches = [
     "doctor tobacco advertisement",
     "celebrity endorsement vintage",
     "expert testimonial poster",
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

### No results from Internet Archive

- IA search API can be inconsistent
- Try different search terms
- Check `mediatype` parameter in the query

### Rate limiting errors

- Increase `rateLimit` value in CONFIG
- Add longer delays between batches

## API Documentation

- **Library of Congress**: https://www.loc.gov/apis/json-and-yaml/
- **Internet Archive**: https://archive.org/advancedsearch.php

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

1. Create a new function (e.g., `scrapeWikimediaCommons()`)
2. Return `ChallengeData[]` array
3. Add to the `allChallenges` array in `main()`
4. Update this README with source-specific notes

## License

Scraped content is from public domain sources. Always verify licensing and attribution requirements for each source.
