/**
 * E2E Example: Classification and validation with generateObject()
 *
 * This example demonstrates:
 * - Content moderation
 * - Intent classification
 * - Sentiment analysis
 * - Data validation and formatting
 */

import { generateObject } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function contentModeration() {
  console.log('=== Example 1: Content Moderation ===\n');

  const userComments = [
    "This product is amazing! Best purchase I've made all year.",
    "This is garbage. Complete waste of money. Don't buy!",
    "I'm going to hack your website and steal your data.",
    "The customer service was helpful and responded quickly.",
  ];

  for (const [index, comment] of userComments.entries()) {
    const { object } = await generateObject({
      model: claude('haiku'),
      schema: z.object({
        isAppropriate: z.boolean(),
        categories: z.array(z.enum([
          'spam',
          'hate_speech',
          'harassment',
          'violence',
          'sexual_content',
          'profanity',
          'threats',
          'safe',
        ])),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        requiresReview: z.boolean(),
        suggestedAction: z.enum(['approve', 'flag', 'remove', 'ban_user']),
        explanation: z.string().describe('Brief explanation of the decision'),
      }),
      prompt: `Moderate this user comment and assess its appropriateness:\n\n"${comment}"`,
    });

    console.log(`Comment ${index + 1}:`, comment.substring(0, 50) + '...');
    console.log('  Appropriate:', object.isAppropriate);
    console.log('  Categories:', object.categories.join(', '));
    console.log('  Severity:', object.severity);
    console.log('  Action:', object.suggestedAction);
    console.log('  Reason:', object.explanation);
    console.log('');
  }
}

async function intentClassification() {
  console.log('\n=== Example 2: User Intent Classification ===\n');

  const userMessages = [
    "I can't log into my account",
    "How much does the premium plan cost?",
    "I want to cancel my subscription",
    "Your product is terrible and doesn't work!",
    "Can you add support for dark mode?",
  ];

  for (const message of userMessages) {
    const { object } = await generateObject({
      model: claude('haiku'),
      schema: z.object({
        intent: z.enum([
          'technical_support',
          'billing_question',
          'feature_request',
          'complaint',
          'cancellation',
          'general_inquiry',
          'praise',
        ]),
        urgency: z.enum(['low', 'medium', 'high']),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        suggestedDepartment: z.enum(['support', 'sales', 'billing', 'product']),
        requiresHumanIntervention: z.boolean(),
        suggestedResponse: z.string().optional(),
      }),
      prompt: `Classify the intent of this customer message:\n\n"${message}"`,
    });

    console.log('Message:', message);
    console.log('  Intent:', object.intent);
    console.log('  Urgency:', object.urgency);
    console.log('  Sentiment:', object.sentiment);
    console.log('  Route to:', object.suggestedDepartment);
    console.log('  Human needed:', object.requiresHumanIntervention);
    console.log('');
  }
}

async function sentimentAnalysis() {
  console.log('\n=== Example 3: Detailed Sentiment Analysis ===\n');

  const reviews = [
    "The hotel was decent. Room was clean but the wifi was slow.",
    "Absolutely loved this place! Will definitely come back!",
    "Terrible experience. Staff was rude and room was dirty.",
  ];

  for (const review of reviews) {
    const { object } = await generateObject({
      model: claude('sonnet'),
      schema: z.object({
        overallSentiment: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']),
        sentimentScore: z.number().min(-1).max(1).describe('Score from -1 to 1'),
        aspects: z.array(z.object({
          aspect: z.string().describe('Specific aspect mentioned (e.g., room, staff, location)'),
          sentiment: z.enum(['positive', 'neutral', 'negative']),
          keywords: z.array(z.string()),
        })),
        emotions: z.array(z.enum(['joy', 'anger', 'sadness', 'disgust', 'fear', 'surprise', 'trust'])),
        actionableInsights: z.array(z.string()),
      }),
      prompt: `Perform detailed sentiment analysis on this review:\n\n"${review}"`,
    });

    console.log('Review:', review);
    console.log('  Overall:', object.overallSentiment, `(${object.sentimentScore})`);
    console.log('  Aspects:');
    object.aspects.forEach(aspect => {
      console.log(`    - ${aspect.aspect}: ${aspect.sentiment} [${aspect.keywords.join(', ')}]`);
    });
    console.log('  Emotions:', object.emotions.join(', '));
    console.log('  Insights:', object.actionableInsights);
    console.log('');
  }
}

async function dataValidation() {
  console.log('\n=== Example 4: Data Validation and Formatting ===\n');

  const messyData = `
    Name: john smith
    Email: JOHN.SMITH@EXAMPLE.COM
    Phone: 555.123.4567
    Address: 123 main st, san francisco, ca 94102
    Date of Birth: 03/15/1990
    SSN: 123-45-6789
  `;

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      firstName: z.string().describe('Properly capitalized first name'),
      lastName: z.string().describe('Properly capitalized last name'),
      email: z.string().email().toLowerCase(),
      phone: z.string().describe('Formatted as (555) 123-4567'),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
      }),
      dateOfBirth: z.string().describe('ISO format YYYY-MM-DD'),
      ssnLast4: z.string().describe('Last 4 digits only'),
      validationIssues: z.array(z.string()).describe('Any validation concerns found'),
    }),
    prompt: `Extract and format this personal data properly, masking sensitive info:\n\n${messyData}`,
  });

  console.log('Validated and Formatted Data:', JSON.stringify(object, null, 2));
}

async function documentClassification() {
  console.log('\n\n=== Example 5: Document Classification ===\n');

  const documents = [
    {
      title: "Q4 2023 Financial Report",
      content: "Revenue increased by 15% compared to Q3. Operating expenses..."
    },
    {
      title: "Employee Handbook Update",
      content: "All employees must complete the new security training by..."
    },
    {
      title: "Product Launch Announcement",
      content: "We are excited to announce the launch of our new product..."
    },
  ];

  for (const doc of documents) {
    const { object } = await generateObject({
      model: claude('haiku'),
      schema: z.object({
        documentType: z.enum([
          'financial_report',
          'legal_document',
          'hr_policy',
          'marketing_material',
          'technical_documentation',
          'internal_memo',
          'customer_communication',
        ]),
        confidentialityLevel: z.enum(['public', 'internal', 'confidential', 'restricted']),
        departments: z.array(z.string()),
        keywords: z.array(z.string()),
        requiresApproval: z.boolean(),
        retentionPeriod: z.enum(['30_days', '1_year', '3_years', '7_years', 'permanent']),
      }),
      prompt: `Classify this document:\n\nTitle: ${doc.title}\nContent: ${doc.content}`,
    });

    console.log('Document:', doc.title);
    console.log('  Type:', object.documentType);
    console.log('  Confidentiality:', object.confidentialityLevel);
    console.log('  Departments:', object.departments.join(', '));
    console.log('  Keywords:', object.keywords.join(', '));
    console.log('  Retention:', object.retentionPeriod);
    console.log('');
  }
}

async function main() {
  try {
    await contentModeration();
    await intentClassification();
    await sentimentAnalysis();
    await dataValidation();
    await documentClassification();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
