/**
 * E2E Example: Basic structured object generation with generateObject()
 *
 * This example demonstrates:
 * - Object generation with Zod schemas
 * - Array generation
 * - Enum generation
 * - No-schema JSON generation
 */

import { generateObject } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function objectGeneration() {
  console.log('=== Example 1: Object Generation ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      recipe: z.object({
        name: z.string(),
        cuisine: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        prepTime: z.number().describe('Preparation time in minutes'),
        cookTime: z.number().describe('Cooking time in minutes'),
        servings: z.number(),
        ingredients: z.array(z.object({
          name: z.string(),
          amount: z.string(),
          unit: z.string(),
        })),
        steps: z.array(z.string()),
        tags: z.array(z.string()),
      }),
    }),
    prompt: 'Generate a recipe for chocolate chip cookies.',
  });

  console.log('Generated Recipe:', JSON.stringify(object, null, 2));
}

async function arrayGeneration() {
  console.log('\n\n=== Example 2: Array Generation ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    output: 'array',
    schema: z.object({
      name: z.string(),
      class: z.string().describe('Character class, e.g. warrior, mage, or thief'),
      level: z.number().min(1).max(20),
      race: z.string(),
      background: z.string().describe('Brief character backstory'),
      stats: z.object({
        strength: z.number(),
        dexterity: z.number(),
        intelligence: z.number(),
        wisdom: z.number(),
      }),
    }),
    prompt: 'Generate 3 hero characters for a fantasy RPG game.',
  });

  console.log('Generated Characters:');
  object.forEach((character, index) => {
    console.log(`\n${index + 1}. ${character.name} (${character.class})`);
    console.log(`   Race: ${character.race}`);
    console.log(`   Level: ${character.level}`);
    console.log(`   Background: ${character.background}`);
    console.log(`   Stats:`, character.stats);
  });
}

async function enumGeneration() {
  console.log('\n\n=== Example 3: Enum Generation ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    output: 'enum',
    enum: ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'thriller', 'romance'],
    prompt:
      'Classify the genre of this movie plot: ' +
      '"A group of astronauts travel through a wormhole in search of a ' +
      'new habitable planet for humanity."',
  });

  console.log('Classified Genre:', object);
}

async function noSchemaGeneration() {
  console.log('\n\n=== Example 4: No-Schema JSON Generation ===\n');

  const { object } = await generateObject({
    model: claude('haiku'),
    output: 'no-schema',
    prompt: 'Generate a simple user profile with name, age, email, and interests.',
  });

  console.log('Generated JSON:', JSON.stringify(object, null, 2));
}

async function nestedObjectGeneration() {
  console.log('\n\n=== Example 5: Complex Nested Object ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      company: z.object({
        name: z.string(),
        founded: z.number(),
        industry: z.string(),
        headquarters: z.object({
          city: z.string(),
          country: z.string(),
          address: z.string(),
        }),
        employees: z.number(),
        departments: z.array(z.object({
          name: z.string(),
          headCount: z.number(),
          manager: z.string(),
        })),
        products: z.array(z.object({
          name: z.string(),
          category: z.string(),
          price: z.number(),
          inStock: z.boolean(),
        })),
        financials: z.object({
          revenue: z.number(),
          expenses: z.number(),
          profit: z.number(),
        }),
      }),
    }),
    prompt: 'Generate a fictional tech company profile with 3 departments and 4 products.',
  });

  console.log('Generated Company Profile:', JSON.stringify(object, null, 2));
}

async function main() {
  try {
    await objectGeneration();
    await arrayGeneration();
    await enumGeneration();
    await noSchemaGeneration();
    await nestedObjectGeneration();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
