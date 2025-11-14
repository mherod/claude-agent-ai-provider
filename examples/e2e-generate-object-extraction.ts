/**
 * E2E Example: Information extraction with generateObject()
 *
 * This example demonstrates:
 * - Extracting structured data from unstructured text
 * - Resume parsing
 * - Article metadata extraction
 * - Product information extraction
 */

import { generateObject } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function resumeExtraction() {
  console.log('=== Example 1: Resume/CV Parsing ===\n');

  const resumeText = `
    John Smith
    Senior Software Engineer
    john.smith@example.com | (555) 123-4567 | San Francisco, CA

    EXPERIENCE

    Senior Software Engineer at TechCorp (2020-Present)
    - Led team of 5 engineers building microservices architecture
    - Reduced API latency by 40% through optimization
    - Implemented CI/CD pipeline using GitHub Actions

    Software Engineer at StartupXYZ (2018-2020)
    - Developed React-based dashboard for analytics
    - Built RESTful APIs using Node.js and Express

    EDUCATION

    B.S. Computer Science, Stanford University (2014-2018)
    GPA: 3.8/4.0

    SKILLS

    Languages: TypeScript, Python, Go, SQL
    Frameworks: React, Node.js, Express, Next.js
    Tools: Docker, Kubernetes, AWS, Git
  `;

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      personalInfo: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        location: z.string(),
        title: z.string(),
      }),
      experience: z.array(z.object({
        company: z.string(),
        position: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        responsibilities: z.array(z.string()),
      })),
      education: z.array(z.object({
        degree: z.string(),
        field: z.string(),
        institution: z.string(),
        graduationYear: z.number(),
        gpa: z.string().optional(),
      })),
      skills: z.object({
        languages: z.array(z.string()),
        frameworks: z.array(z.string()),
        tools: z.array(z.string()),
      }),
    }),
    prompt: `Extract structured information from this resume:\n\n${resumeText}`,
  });

  console.log('Extracted Resume Data:\n');
  console.log('Personal Info:', object.personalInfo);
  console.log('\nExperience:');
  object.experience.forEach((exp, i) => {
    console.log(`  ${i + 1}. ${exp.position} at ${exp.company}`);
    console.log(`     ${exp.startDate} - ${exp.endDate || 'Present'}`);
  });
  console.log('\nEducation:', object.education);
  console.log('\nSkills:', object.skills);
}

async function articleMetadataExtraction() {
  console.log('\n\n=== Example 2: Article Metadata Extraction ===\n');

  const article = `
    The Future of Artificial Intelligence in Healthcare

    By Dr. Sarah Johnson, Published on March 15, 2024

    Artificial intelligence is revolutionizing healthcare in unprecedented ways.
    From diagnostic imaging to drug discovery, AI systems are becoming
    indispensable tools for medical professionals.

    Recent studies show that AI-powered diagnostic systems can detect certain
    cancers with accuracy rates exceeding 95%, often catching cases that human
    radiologists might miss. Machine learning algorithms are also accelerating
    drug discovery, reducing the time to market for new treatments by up to 40%.

    However, challenges remain. Privacy concerns, regulatory hurdles, and the
    need for diverse training data continue to pose obstacles to widespread
    AI adoption in healthcare.

    Tags: AI, Healthcare, Medical Technology, Machine Learning
    Category: Technology
  `;

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      title: z.string(),
      author: z.string(),
      publicationDate: z.string(),
      category: z.string(),
      tags: z.array(z.string()),
      summary: z.string().describe('Brief summary of the article in 1-2 sentences'),
      mainTopics: z.array(z.string()).describe('Key topics discussed in the article'),
      keyStatistics: z.array(z.object({
        fact: z.string(),
        value: z.string(),
      })),
      sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
      readingTime: z.number().describe('Estimated reading time in minutes'),
    }),
    prompt: `Extract metadata and key information from this article:\n\n${article}`,
  });

  console.log('Extracted Article Metadata:', JSON.stringify(object, null, 2));
}

async function productExtraction() {
  console.log('\n\n=== Example 3: Product Information Extraction ===\n');

  const productDescription = `
    UltraSound Pro 5000 Wireless Headphones

    Price: $299.99 (20% off - was $374.99)
    In Stock: Yes
    Ships in: 1-2 business days

    Experience premium audio quality with our flagship UltraSound Pro 5000.
    These over-ear wireless headphones feature:

    • Active Noise Cancellation (ANC) with 3 modes
    • 40-hour battery life with ANC off, 30 hours with ANC on
    • Bluetooth 5.2 with multipoint connection
    • Custom 50mm drivers for rich, balanced sound
    • Premium memory foam ear cushions
    • Foldable design with hard carrying case
    • Voice assistant compatible (Alexa, Google Assistant, Siri)

    Specifications:
    - Weight: 285g
    - Frequency Response: 20Hz - 40kHz
    - Impedance: 32 Ohms
    - Wireless Range: 10 meters
    - Charging: USB-C (2 hours for full charge)

    Customer Rating: 4.7/5 stars (based on 1,247 reviews)

    Color Options: Black, Silver, Navy Blue
    Warranty: 2 years
  `;

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      name: z.string(),
      price: z.object({
        current: z.number(),
        original: z.number().optional(),
        discount: z.number().optional().describe('Discount percentage'),
      }),
      availability: z.object({
        inStock: z.boolean(),
        shippingTime: z.string(),
      }),
      features: z.array(z.string()),
      specifications: z.record(z.string(), z.string()),
      rating: z.object({
        score: z.number(),
        reviewCount: z.number(),
      }),
      options: z.object({
        colors: z.array(z.string()),
      }),
      warranty: z.string(),
    }),
    prompt: `Extract structured product information:\n\n${productDescription}`,
  });

  console.log('Extracted Product Data:', JSON.stringify(object, null, 2));
}

async function emailExtraction() {
  console.log('\n\n=== Example 4: Email Parsing ===\n');

  const email = `
    From: alice.cooper@techcorp.com
    To: bob.martin@techcorp.com
    CC: team@techcorp.com
    Subject: Q1 Planning Meeting - Action Items
    Date: January 10, 2024 at 2:30 PM

    Hi Bob,

    Thanks for attending the Q1 planning meeting today. Here's a summary of
    the action items we discussed:

    1. Update project timeline - Due: Jan 15 (Bob)
    2. Review budget allocation - Due: Jan 18 (Alice)
    3. Schedule stakeholder interviews - Due: Jan 20 (Team)
    4. Prepare technical proposal - Due: Jan 25 (Bob)

    Our next meeting is scheduled for January 30th at 10 AM in Conference Room B.

    Please confirm if these deadlines work for you.

    Best regards,
    Alice Cooper
    Senior Project Manager
    TechCorp Solutions
  `;

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      from: z.object({
        email: z.string(),
        name: z.string().optional(),
      }),
      to: z.array(z.string()),
      cc: z.array(z.string()).optional(),
      subject: z.string(),
      date: z.string(),
      actionItems: z.array(z.object({
        task: z.string(),
        assignee: z.string(),
        dueDate: z.string(),
      })),
      meetings: z.array(z.object({
        date: z.string(),
        time: z.string(),
        location: z.string(),
      })),
      priority: z.enum(['high', 'medium', 'low']),
      category: z.enum(['meeting', 'task', 'information', 'request', 'other']),
    }),
    prompt: `Parse this email and extract structured information:\n\n${email}`,
  });

  console.log('Extracted Email Data:', JSON.stringify(object, null, 2));
  console.log('\nAction Items:');
  object.actionItems.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.task} - ${item.assignee} (Due: ${item.dueDate})`);
  });
}

async function main() {
  try {
    await resumeExtraction();
    await articleMetadataExtraction();
    await productExtraction();
    await emailExtraction();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
