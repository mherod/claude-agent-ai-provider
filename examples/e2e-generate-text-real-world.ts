/**
 * E2E Example: Real-world use cases with generateText()
 *
 * This example demonstrates practical applications:
 * - Content generation and summarization
 * - Data analysis
 * - Code generation
 * - Decision making
 */

import { generateText, tool } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function contentSummarizationExample() {
  console.log('=== Example 1: Content Summarization ===\n');

  const longArticle = `
    Artificial Intelligence (AI) has become one of the most transformative technologies
    of the 21st century. From its early beginnings in the 1950s with pioneers like
    Alan Turing and John McCarthy, AI has evolved from simple rule-based systems to
    sophisticated neural networks capable of learning from vast amounts of data.

    Modern AI applications span numerous fields including healthcare, where AI helps
    diagnose diseases and discover new drugs; finance, where it detects fraud and
    automates trading; transportation, powering self-driving cars; and entertainment,
    creating personalized recommendations for movies and music.

    Machine learning, a subset of AI, has been particularly revolutionary. Deep learning,
    which uses multi-layered neural networks, has achieved breakthrough performance in
    image recognition, natural language processing, and game playing. Recent developments
    in large language models have demonstrated remarkable capabilities in understanding
    and generating human-like text.

    However, AI also raises important ethical questions about privacy, bias, job
    displacement, and the concentration of power. As AI systems become more capable,
    society must grapple with how to ensure they are developed and deployed responsibly.
  `;

  const result = await generateText({
    model: claude('sonnet'),
    system: 'You are an expert at creating concise, informative summaries.',
    prompt: `Summarize the following article in 3 bullet points:\n\n${longArticle}`,
  });

  console.log('Summary:\n', result.text);
  console.log('\nUsage:', result.usage);
}

async function dataAnalysisExample() {
  console.log('\n\n=== Example 2: Data Analysis Assistant ===\n');

  const salesData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 33000 },
    { month: 'Apr', revenue: 61000, expenses: 38000 },
    { month: 'May', revenue: 59000, expenses: 36000 },
  ];

  const result = await generateText({
    model: claude('sonnet'),
    prompt: `Analyze this sales data and provide insights:\n${JSON.stringify(salesData, null, 2)}`,
    tools: {
      calculateMetrics: tool({
        description: 'Calculate financial metrics from the data',
        parameters: z.object({
          metricType: z.enum(['total', 'average', 'profit', 'growth']),
          field: z.enum(['revenue', 'expenses']).optional(),
        }),
        execute: async ({ metricType, field }) => {
          console.log(`[Analysis] Calculating ${metricType} for ${field || 'all'}`);

          if (metricType === 'profit') {
            const totalProfit = salesData.reduce(
              (sum, month) => sum + (month.revenue - month.expenses),
              0
            );
            return { totalProfit, avgMonthlyProfit: totalProfit / salesData.length };
          }

          if (metricType === 'growth' && field) {
            const first = salesData[0][field];
            const last = salesData[salesData.length - 1][field];
            const growthRate = ((last - first) / first) * 100;
            return { growthRate: growthRate.toFixed(2) + '%' };
          }

          if (metricType === 'average' && field) {
            const avg = salesData.reduce((sum, m) => sum + m[field], 0) / salesData.length;
            return { average: avg };
          }

          if (metricType === 'total' && field) {
            const total = salesData.reduce((sum, m) => sum + m[field], 0);
            return { total };
          }

          return {};
        },
      }),
    },
    maxSteps: 5,
  });

  console.log('Analysis:\n', result.text);
  console.log('\nTool Calls Made:', result.toolCalls.length);
}

async function codeGenerationExample() {
  console.log('\n\n=== Example 3: Code Generation ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    system: 'You are an expert TypeScript developer who writes clean, well-documented code.',
    prompt: `Create a TypeScript function that:
1. Takes an array of numbers
2. Filters out negative numbers
3. Squares each remaining number
4. Returns the sum of the squares

Include JSDoc comments and type annotations.`,
    temperature: 0.3, // Lower temperature for more consistent code generation
  });

  console.log('Generated Code:\n');
  console.log(result.text);
  console.log('\nUsage:', result.usage);
}

async function decisionMakingExample() {
  console.log('\n\n=== Example 4: AI Decision Making Assistant ===\n');

  const products = [
    { id: 1, name: 'Laptop Pro', price: 1299, rating: 4.5, stock: 15 },
    { id: 2, name: 'Laptop Air', price: 999, rating: 4.7, stock: 8 },
    { id: 3, name: 'Laptop Mini', price: 699, rating: 4.2, stock: 25 },
  ];

  const result = await generateText({
    model: claude('sonnet'),
    prompt: `I need to buy a laptop with budget under $1100. Which one should I choose and why?`,
    tools: {
      getProducts: tool({
        description: 'Get list of available products',
        parameters: z.object({
          category: z.string().optional(),
        }),
        execute: async () => {
          console.log('[Database] Fetching products');
          return products;
        },
      }),
      filterByPrice: tool({
        description: 'Filter products by maximum price',
        parameters: z.object({
          maxPrice: z.number(),
        }),
        execute: async ({ maxPrice }) => {
          console.log(`[Filter] Products under $${maxPrice}`);
          return products.filter(p => p.price <= maxPrice);
        },
      }),
      compareProducts: tool({
        description: 'Compare products by a specific criteria',
        parameters: z.object({
          productIds: z.array(z.number()),
          criteria: z.enum(['price', 'rating', 'stock']),
        }),
        execute: async ({ productIds, criteria }) => {
          console.log(`[Compare] Comparing products ${productIds.join(', ')} by ${criteria}`);
          const selected = products.filter(p => productIds.includes(p.id));
          return selected.map(p => ({
            name: p.name,
            [criteria]: p[criteria],
          }));
        },
      }),
    },
    maxSteps: 10,
  });

  console.log('Recommendation:\n', result.text);
  console.log('\nDecision Process (steps):', result.steps.length);
}

async function emailDraftingExample() {
  console.log('\n\n=== Example 5: Email Drafting ===\n');

  const context = {
    recipient: 'Sarah Johnson',
    company: 'TechCorp Solutions',
    meeting: {
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '30 minutes',
      topic: 'Q1 Product Roadmap Review',
    },
  };

  const result = await generateText({
    model: claude('sonnet'),
    system: 'You are a professional business communication assistant.',
    prompt: `Draft a meeting confirmation email with the following details:
- Recipient: ${context.recipient} from ${context.company}
- Meeting: ${context.meeting.topic}
- Date: ${context.meeting.date}
- Time: ${context.meeting.time}
- Duration: ${context.meeting.duration}

The email should be professional, friendly, and include:
1. Confirmation of the meeting
2. Brief agenda overview
3. Request for any topics they'd like to discuss
4. Video call link placeholder`,
    temperature: 0.7,
  });

  console.log('Generated Email:\n');
  console.log(result.text);
  console.log('\nUsage:', result.usage);
}

async function main() {
  try {
    await contentSummarizationExample();
    await dataAnalysisExample();
    await codeGenerationExample();
    await decisionMakingExample();
    await emailDraftingExample();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
