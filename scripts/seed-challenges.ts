import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface ChallengeJSON {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  imageFilename: string;
  era: string;
  historicalContext: string;
  primaryTechnique: string;
  allTechniques: string[];
  difficulty: string;
  explanation: string;
  correctAnswers: string[];
}

// Remove [NEEDS REVIEW] tags from text
function cleanText(text: string): string {
  return text.replace(/\[NEEDS REVIEW\]\s*/, '');
}

// Convert image filename to static path
function getImageUrl(filename: string): string {
  return `/images/${filename}`;
}

async function seedChallenges() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🌱 Starting database seeding...');

  const client = createClient({ url: databaseUrl });
  const db = drizzle(client, { schema });

  try {
    // 1. Set up paths
    const sourceChallengersDir = join(process.cwd(), 'lib', 'assets', 'challenges');

    // 2. Read all challenge files from lib/assets/challenges
    let files: string[] = [];
    try {
      files = readdirSync(sourceChallengersDir).filter((file) => file.endsWith('.json'));
      console.log(`📂 Found ${files.length} challenge files`);
    } catch (error) {
      console.log(`  ⚠ Source challenges directory not found at ${sourceChallengersDir}`);
      console.log(`  ⚠ Skipping seeding - run scraper first to generate challenge files`);
      console.log(`\n❌ Cannot proceed without challenge JSON files`);
      process.exit(1);
    }

    const challenges: ChallengeJSON[] = [];
    const techniquesSet = new Set<string>();

    // Parse all challenge files and collect unique techniques
    for (const file of files) {
      const filePath = join(sourceChallengersDir, file);
      const fileContent = readFileSync(filePath, 'utf-8');
      const challenge = JSON.parse(fileContent) as ChallengeJSON;
      challenges.push(challenge);

      // Collect all techniques
      if (challenge.primaryTechnique) {
        techniquesSet.add(challenge.primaryTechnique);
      }
      challenge.allTechniques.forEach((t) => techniquesSet.add(t));
    }

    const techniques = Array.from(techniquesSet);
    console.log(`🏷️  Found ${techniques.length} unique technique(s): ${techniques.join(', ')}`);

    // 2. Seed techniques table
    console.log('\n📝 Seeding techniques table...');
    for (const technique of techniques) {
      const existing = await db.query.techniques.findFirst({
        where: eq(schema.techniques.id, technique),
      });

      if (existing) {
        console.log(`  ✓ Technique '${technique}' already exists`);
      } else {
        // Create default technique data
        await db.insert(schema.techniques).values({
          id: technique,
          name: technique
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          description: `This technique represents the "${technique}" persuasion method.`,
          exampleText: `An example of the ${technique} technique in propaganda.`,
        });
        console.log(`  ✓ Created technique '${technique}'`);
      }
    }

    // 3. Seed challenges table
    console.log('\n📚 Seeding challenges table...');
    let successCount = 0;
    let skipCount = 0;

    for (const challenge of challenges) {
      const existing = await db.query.challenges.findFirst({
        where: eq(schema.challenges.id, challenge.id),
      });

      if (existing) {
        console.log(`  ⊘ Challenge '${challenge.id}' already exists, skipping`);
        skipCount++;
        continue;
      }

      await db.insert(schema.challenges).values({
        id: challenge.id,
        title: challenge.title,
        contentText: challenge.title, // Using title as contentText per requirements
        imageUrl: getImageUrl(challenge.imageFilename),
        historicalContext: cleanText(challenge.historicalContext),
        difficulty: challenge.difficulty,
        primaryTechnique: challenge.primaryTechnique,
        techniques: JSON.stringify(challenge.allTechniques),
        explanation: cleanText(challenge.explanation),
      });

      console.log(`  ✓ Created challenge '${challenge.id}'`);
      successCount++;
    }

    // 4. Generate quizzes from challenges
    console.log('\n🎯 Generating quizzes...');

    // Group challenges by primary technique
    const challengesByTechnique = new Map<string, typeof challenges>();
    for (const challenge of challenges) {
      if (!challengesByTechnique.has(challenge.primaryTechnique)) {
        challengesByTechnique.set(challenge.primaryTechnique, []);
      }
      challengesByTechnique.get(challenge.primaryTechnique)!.push(challenge);
    }

    let quizCount = 0;
    let quizChallengeCount = 0;

    // Create quizzes for each technique
    for (const [techniqueId, techniqueChallenges] of challengesByTechnique) {
      let quizNumber = 1;

      // Create multiple quizzes if we have more than 10 challenges
      for (let i = 0; i < techniqueChallenges.length; i += 10) {
        const quizChallengesSlice = techniqueChallenges.slice(i, i + 10);
        const quizId = `${techniqueId}-quiz-${quizNumber}`;

        // Check if quiz already exists
        const existingQuiz = await db.query.quizzes.findFirst({
          where: (q) => eq(q.id, quizId),
        });

        if (!existingQuiz) {
          // Get the technique name
          const technique = await db.query.techniques.findFirst({
            where: eq(schema.techniques.id, techniqueId),
          });

          if (technique) {
            // Determine difficulty based on position
            const difficulty = quizNumber === 1 ? 'beginner' : quizNumber === 2 ? 'intermediate' : 'advanced';

            await db.insert(schema.quizzes).values({
              id: quizId,
              title: `${technique.name} Quiz ${quizNumber}`,
              description: `Practice identifying ${technique.name} across ${quizChallengesSlice.length} challenges`,
              primaryTechniqueId: techniqueId,
              techniqueIds: JSON.stringify([techniqueId]),
              difficulty,
              orderIndex: quizNumber - 1,
            });

            // Add challenges to quiz
            for (let j = 0; j < quizChallengesSlice.length; j++) {
              const quizChallenge = quizChallengesSlice[j];
              await db.insert(schema.quizChallenges).values({
                id: `${quizId}-${j}`,
                quizId,
                challengeId: quizChallenge.id,
                orderIndex: j,
              });
              quizChallengeCount++;
            }

            console.log(`  ✓ Created quiz '${quizId}' with ${quizChallengesSlice.length} challenges`);
            quizCount++;
          }
        } else {
          console.log(`  ⊘ Quiz '${quizId}' already exists, skipping`);
        }

        quizNumber++;
      }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`   - Techniques: ${techniques.length}`);
    console.log(`   - Challenges created: ${successCount}`);
    if (skipCount > 0) {
      console.log(`   - Challenges skipped: ${skipCount}`);
    }
    console.log(`   - Quizzes created: ${quizCount}`);
    console.log(`   - Quiz challenges linked: ${quizChallengeCount}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedChallenges();
