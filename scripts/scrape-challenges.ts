#!/usr/bin/env node
/**
 * Web Scraper for Unframe Propaganda Challenges
 *
 * Scrapes historical propaganda materials from:
 * - Library of Congress
 * - Internet Archive
 * - Wikimedia Commons
 * - Prelinger Archives
 *
 * Stores data as JSON files with images in lib/assets/
 */

import * as fs from "fs/promises";
import * as path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

// Configuration
const CONFIG = {
  technique: "fear-appeal",
  techniqueName: "Fear Appeals",
  outputDir: path.join(process.cwd(), "lib", "assets"),
  challengesDir: path.join(process.cwd(), "lib", "assets", "challenges"),
  imagesDir: path.join(process.cwd(), "static", "images"),
  targetCount: 15,
  dryRun: process.argv.includes("--dry-run"),
  rateLimit: 2000, // ms between requests
};

// Types
interface ChallengeData {
  id: string;
  title: string;
  source:
    | "Library of Congress"
    | "Internet Archive"
    | "Wikimedia Commons"
    | "Prelinger Archives";
  sourceUrl: string;
  imageUrl: string;
  imageFilename: string;
  era: string;
  historicalContext: string;
  primaryTechnique: string;
  allTechniques: string[];
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  correctAnswers: string[];
}

// Utility: Sleep for rate limiting
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility: Download image
async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    // @ts-ignore - Node.js streams
    await pipeline(response.body, createWriteStream(filepath));
    console.log(`  ✓ Downloaded image: ${filepath}`);
  } catch (error) {
    console.error(`  ✗ Error downloading ${url}:`, error);
    throw error;
  }
}

// Utility: Generate challenge ID
let challengeCounter = 1;
function generateChallengeId(): string {
  return `fear-${String(challengeCounter++).padStart(3, "0")}`;
}

// Utility: Save challenge JSON
async function saveChallenge(challenge: ChallengeData): Promise<void> {
  const filepath = path.join(CONFIG.challengesDir, `${challenge.id}.json`);
  await fs.writeFile(filepath, JSON.stringify(challenge, null, 2));
  console.log(`  ✓ Saved challenge: ${filepath}`);
}

/**
 * Library of Congress API Scraper
 * API Docs: https://www.loc.gov/apis/json-and-yaml/
 */
async function scrapeLOC(): Promise<ChallengeData[]> {
  console.log("\n📚 Scraping Library of Congress...\n");

  const challenges: ChallengeData[] = [];

  // Search queries for fear-based propaganda
  const searches = [
    "war bonds poster",
    "enemy threat poster",
    "world war poster danger",
    "home front warning poster",
  ];

  for (const query of searches) {
    if (challenges.length >= 10) break;

    console.log(`  Searching: "${query}"...`);

    try {
      // LOC API endpoint
      const url = `https://www.loc.gov/search/?q=${encodeURIComponent(query)}&fo=json&c=100&at=results,pagination`;

      await sleep(CONFIG.rateLimit);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`  ⚠ API error: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const results = data.results || [];

      // Process results
      for (const item of results.slice(0, 3)) {
        if (challenges.length >= 10) break;

        // Check if item has an image
        const image = item.image_url?.[0];
        if (!image) continue;

        // Extract metadata
        const title = item.title || "Untitled";
        const date = item.date || "1940s";
        const url = item.id || item.url || "";

        const challengeId = generateChallengeId();
        const imageFilename = `${challengeId}.jpg`;

        const challenge: ChallengeData = {
          id: challengeId,
          title,
          source: "Library of Congress",
          sourceUrl: url,
          imageUrl: image,
          imageFilename,
          era: date,
          historicalContext: `[NEEDS REVIEW] ${item.description || "Historical propaganda poster from the Library of Congress collection."}`,
          primaryTechnique: CONFIG.technique,
          allTechniques: [CONFIG.technique],
          difficulty: "medium",
          explanation:
            "[NEEDS REVIEW] This piece uses fear appeals to motivate action by highlighting dangers and threats.",
          correctAnswers: [CONFIG.technique],
        };

        challenges.push(challenge);
        console.log(`  ✓ Found: ${title.substring(0, 60)}...`);
      }
    } catch (error) {
      console.error(`  ✗ Error with query "${query}":`, error);
    }
  }

  console.log(
    `\n  📊 Found ${challenges.length} items from Library of Congress\n`,
  );
  return challenges;
}

/**
 * Internet Archive Scraper
 * API Docs: https://archive.org/advancedsearch.php
 */
async function scrapeInternetArchive(): Promise<ChallengeData[]> {
  console.log("\n🗃️  Scraping Internet Archive...\n");

  const challenges: ChallengeData[] = [];

  // Search queries for fear-based content
  const searches = [
    "safety poster",
    "health warning poster",
    "venereal disease campaign",
    "industrial safety poster",
  ];

  for (const query of searches) {
    if (challenges.length >= 5) break;

    console.log(`  Searching: "${query}"...`);

    try {
      // Internet Archive API
      const searchParams = new URLSearchParams({
        q: query,
        output: "json",
        rows: "10",
        "fl[]": "identifier,title,description,date,imagecount",
        mediatype: "image",
      });

      const url = `https://archive.org/advancedsearch.php?${searchParams.toString()}`;

      await sleep(CONFIG.rateLimit);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`  ⚠ API error: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const docs = data.response?.docs || [];

      // Process results
      for (const item of docs) {
        if (challenges.length >= 5) break;
        if (!item.imagecount || item.imagecount === "0") continue;

        const identifier = item.identifier;
        const title = item.title || "Untitled";
        const date = item.date || "1950s";

        // Construct image URL (typical IA pattern)
        const imageUrl = `https://archive.org/services/img/${identifier}`;
        const itemUrl = `https://archive.org/details/${identifier}`;

        const challengeId = generateChallengeId();
        const imageFilename = `${challengeId}.jpg`;

        const challenge: ChallengeData = {
          id: challengeId,
          title,
          source: "Internet Archive",
          sourceUrl: itemUrl,
          imageUrl,
          imageFilename,
          era: date,
          historicalContext: `[NEEDS REVIEW] ${item.description || "Historical safety and health campaign material from the Internet Archive."}`,
          primaryTechnique: CONFIG.technique,
          allTechniques: [CONFIG.technique],
          difficulty: "medium",
          explanation:
            "[NEEDS REVIEW] This content employs fear-based messaging to encourage behavioral change through highlighting risks.",
          correctAnswers: [CONFIG.technique],
        };

        challenges.push(challenge);
        console.log(`  ✓ Found: ${title.substring(0, 60)}...`);
      }
    } catch (error) {
      console.error(`  ✗ Error with query "${query}":`, error);
    }
  }

  console.log(
    `\n  📊 Found ${challenges.length} items from Internet Archive\n`,
  );
  return challenges;
}

/**
 * Wikimedia Commons API Scraper
 * API Docs: https://www.mediawiki.org/wiki/API:Main_page
 */
async function scrapeWikimediaCommons(): Promise<ChallengeData[]> {
  console.log("\n🖼️  Scraping Wikimedia Commons...\n");

  const challenges: ChallengeData[] = [];

  // Categories with fear-based propaganda
  const categories = [
    "Category:World_War_II_propaganda_posters",
    "Category:World_War_I_propaganda_posters",
    "Category:Cold_War_propaganda",
  ];

  for (const category of categories) {
    if (challenges.length >= 10) break;

    console.log(`  Searching category: "${category}"...`);

    try {
      const params = new URLSearchParams({
        action: "query",
        generator: "categorymembers",
        gcmtitle: category,
        gcmtype: "file",
        gcmlimit: "20",
        prop: "imageinfo",
        iiprop: "url|extmetadata|timestamp",
        format: "json",
      });

      const url = `https://commons.wikimedia.org/w/api.php?${params}`;

      await sleep(CONFIG.rateLimit);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`  ⚠ API error: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const pages = data.query?.pages || {};

      // Process results
      for (const pageId in pages) {
        if (challenges.length >= 10) break;

        const page = pages[pageId];
        const imageInfo = page.imageinfo?.[0];
        if (!imageInfo) continue;

        const metadata = imageInfo.extmetadata || {};
        const title = page.title
          .replace("File:", "")
          .replace(/\.(jpg|png|gif)$/i, "");
        const dateValue =
          metadata.DateTimeOriginal?.value ||
          metadata.DateTime?.value ||
          "1940s";
        const date = dateValue.substring(0, 10); // Extract date portion

        const challengeId = generateChallengeId();
        const imageFilename = `${challengeId}.jpg`;

        const challenge: ChallengeData = {
          id: challengeId,
          title,
          source: "Wikimedia Commons",
          sourceUrl:
            imageInfo.descriptionurl ||
            `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title)}`,
          imageUrl: imageInfo.url,
          imageFilename,
          era: date,
          historicalContext: `[NEEDS REVIEW] ${metadata.ImageDescription?.value || "Public domain propaganda poster from Wikimedia Commons."}`,
          primaryTechnique: CONFIG.technique,
          allTechniques: [CONFIG.technique],
          difficulty: "medium",
          explanation:
            "[NEEDS REVIEW] This piece uses fear appeals to motivate action by highlighting dangers and threats.",
          correctAnswers: [CONFIG.technique],
        };

        challenges.push(challenge);
        console.log(`  ✓ Found: ${title.substring(0, 60)}...`);
      }
    } catch (error) {
      console.error(`  ✗ Error with category "${category}":`, error);
    }
  }

  console.log(
    `\n  📊 Found ${challenges.length} items from Wikimedia Commons\n`,
  );
  return challenges;
}

/**
 * Prelinger Archives Scraper (via Internet Archive)
 * API Docs: https://archive.org/advancedsearch.php
 */
async function scrapePrelingerArchives(): Promise<ChallengeData[]> {
  console.log("\n🎞️  Scraping Prelinger Archives...\n");

  const challenges: ChallengeData[] = [];

  // Search queries for fear-based educational content
  const searches = [
    "collection:prelinger AND (safety OR danger)",
    "collection:prelinger AND civil defense",
    'collection:prelinger AND "industrial safety"',
    "collection:prelinger AND venereal disease",
  ];

  for (const query of searches) {
    if (challenges.length >= 8) break;

    console.log(`  Searching: "${query}"...`);

    try {
      const params = new URLSearchParams({
        q: query,
        "fl[]": "identifier,title,description,date,year,subject",
        output: "json",
        rows: "5",
      });

      const url = `https://archive.org/advancedsearch.php?${params}`;

      await sleep(CONFIG.rateLimit);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`  ⚠ API error: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const docs = data.response?.docs || [];

      // Process results
      for (const item of docs) {
        if (challenges.length >= 8) break;

        const identifier = item.identifier;
        const title = item.title || "Untitled";
        const date = item.year || item.date || "1950s";

        // Use thumbnail service for video frames
        const imageUrl = `https://archive.org/services/img/${identifier}`;
        const itemUrl = `https://archive.org/details/${identifier}`;

        const challengeId = generateChallengeId();
        const imageFilename = `${challengeId}.jpg`;

        const challenge: ChallengeData = {
          id: challengeId,
          title,
          source: "Prelinger Archives",
          sourceUrl: itemUrl,
          imageUrl,
          imageFilename,
          era: date,
          historicalContext: `[NEEDS REVIEW] ${item.description || "Historical safety and educational film from the Prelinger Archives."}`,
          primaryTechnique: CONFIG.technique,
          allTechniques: [CONFIG.technique],
          difficulty: "medium",
          explanation:
            "[NEEDS REVIEW] This content uses fear-based messaging to encourage behavioral change.",
          correctAnswers: [CONFIG.technique],
        };

        challenges.push(challenge);
        console.log(`  ✓ Found: ${title.substring(0, 60)}...`);
      }
    } catch (error) {
      console.error(`  ✗ Error with query "${query}":`, error);
    }
  }

  console.log(
    `\n  📊 Found ${challenges.length} items from Prelinger Archives\n`,
  );
  return challenges;
}

/**
 * Main execution
 */
async function main() {
  console.log("🎯 Unframe Challenge Scraper");
  console.log("═══════════════════════════════════════\n");
  console.log(`Technique: ${CONFIG.techniqueName}`);
  console.log(`Target: ${CONFIG.targetCount} challenges`);
  console.log(`Output: ${CONFIG.outputDir}`);
  console.log(`Dry run: ${CONFIG.dryRun ? "YES" : "NO"}\n`);

  if (CONFIG.dryRun) {
    console.log("⚠️  DRY RUN MODE - No files will be saved\n");
  }

  try {
    // Ensure directories exist
    await fs.mkdir(CONFIG.challengesDir, { recursive: true });
    await fs.mkdir(CONFIG.imagesDir, { recursive: true });

    // Scrape from all sources
    const locChallenges = await scrapeLOC();
    const iaChallenges = await scrapeInternetArchive();
    const wikimediaChallenges = await scrapeWikimediaCommons();
    const prelingerChallenges = await scrapePrelingerArchives();

    const allChallenges = [
      ...locChallenges,
      ...iaChallenges,
      ...wikimediaChallenges,
      ...prelingerChallenges,
    ];

    console.log("\n═══════════════════════════════════════");
    console.log(`\n📦 Total challenges found: ${allChallenges.length}\n`);

    if (CONFIG.dryRun) {
      console.log("Dry run complete. No files saved.");
      console.log("\nSample challenge:");
      console.log(JSON.stringify(allChallenges[0], null, 2));
      return;
    }

    // Download images and save challenges
    console.log("💾 Downloading images and saving challenges...\n");

    for (const challenge of allChallenges) {
      try {
        // Download image
        const imagePath = path.join(CONFIG.imagesDir, challenge.imageFilename);
        await downloadImage(challenge.imageUrl, imagePath);

        // Save JSON
        await saveChallenge(challenge);

        await sleep(CONFIG.rateLimit); // Rate limiting
      } catch (error) {
        console.error(`  ✗ Failed to process ${challenge.id}:`, error);
      }
    }

    console.log("\n✅ Scraping complete!\n");
    console.log("═══════════════════════════════════════\n");
    console.log("📋 Next steps:");
    console.log("1. Review generated JSON files in lib/assets/challenges/");
    console.log("2. Update historicalContext and explanation fields");
    console.log("3. Add additional technique tags if applicable");
    console.log("4. Adjust difficulty levels based on content");
    console.log("5. Verify all images downloaded correctly\n");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  main,
  scrapeLOC,
  scrapeInternetArchive,
  scrapeWikimediaCommons,
  scrapePrelingerArchives,
};
