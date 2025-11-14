/**
 * E2E Example: Synthetic data generation with generateObject()
 *
 * This example demonstrates:
 * - Test data generation
 * - Mock API responses
 * - Sample database records
 * - Fake user profiles
 */

import { generateObject } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function testDataGeneration() {
  console.log('=== Example 1: Generate Test User Profiles ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    output: 'array',
    schema: z.object({
      id: z.string().uuid(),
      username: z.string(),
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      age: z.number().min(18).max(80),
      country: z.string(),
      role: z.enum(['user', 'admin', 'moderator']),
      isActive: z.boolean(),
      joinedAt: z.string().describe('ISO date string'),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'auto']),
        notifications: z.boolean(),
        language: z.string(),
      }),
    }),
    prompt: 'Generate 5 diverse test user profiles for a web application. Include users from different countries and age groups.',
  });

  console.log('Generated Test Users:\n');
  object.forEach((user, i) => {
    console.log(`${i + 1}. ${user.firstName} ${user.lastName} (@${user.username})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Age: ${user.age}, Country: ${user.country}`);
    console.log(`   Role: ${user.role}, Active: ${user.isActive}`);
    console.log('');
  });
}

async function mockAPIResponse() {
  console.log('\n=== Example 2: Generate Mock API Response ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      status: z.enum(['success', 'error']),
      data: z.object({
        orders: z.array(z.object({
          orderId: z.string(),
          customerId: z.string(),
          items: z.array(z.object({
            productId: z.string(),
            productName: z.string(),
            quantity: z.number(),
            price: z.number(),
          })),
          subtotal: z.number(),
          tax: z.number(),
          total: z.number(),
          status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
          orderDate: z.string(),
          shippingAddress: z.object({
            street: z.string(),
            city: z.string(),
            state: z.string(),
            zipCode: z.string(),
            country: z.string(),
          }),
        })),
        pagination: z.object({
          page: z.number(),
          perPage: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      timestamp: z.string(),
    }),
    prompt: 'Generate a mock API response for an e-commerce orders endpoint with 3 orders, including realistic product names and addresses.',
  });

  console.log('Mock API Response:', JSON.stringify(object, null, 2));
}

async function databaseRecords() {
  console.log('\n\n=== Example 3: Generate Sample Database Records ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    output: 'array',
    schema: z.object({
      id: z.number(),
      title: z.string(),
      content: z.string().describe('Blog post content, 2-3 sentences'),
      author: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      }),
      category: z.string(),
      tags: z.array(z.string()),
      published: z.boolean(),
      publishedAt: z.string().nullable(),
      views: z.number(),
      likes: z.number(),
      comments: z.array(z.object({
        id: z.number(),
        userId: z.number(),
        userName: z.string(),
        content: z.string(),
        createdAt: z.string(),
      })),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
    prompt: 'Generate 3 sample blog post records for a content management system. Include realistic titles, content, and 2-3 comments per post.',
  });

  console.log('Sample Blog Posts:\n');
  object.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    console.log(`   Author: ${post.author.name}`);
    console.log(`   Category: ${post.category}`);
    console.log(`   Tags: ${post.tags.join(', ')}`);
    console.log(`   Stats: ${post.views} views, ${post.likes} likes, ${post.comments.length} comments`);
    console.log(`   Published: ${post.published ? 'Yes' : 'No'}`);
    console.log('');
  });
}

async function eventCalendar() {
  console.log('\n=== Example 4: Generate Event Calendar Data ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    output: 'array',
    schema: z.object({
      eventId: z.string(),
      title: z.string(),
      description: z.string(),
      eventType: z.enum(['meeting', 'conference', 'workshop', 'webinar', 'social']),
      startTime: z.string().describe('ISO datetime'),
      endTime: z.string().describe('ISO datetime'),
      location: z.object({
        type: z.enum(['physical', 'virtual', 'hybrid']),
        venue: z.string(),
        address: z.string().optional(),
        meetingLink: z.string().url().optional(),
      }),
      organizer: z.object({
        name: z.string(),
        email: z.string(),
        company: z.string().optional(),
      }),
      attendees: z.array(z.object({
        name: z.string(),
        email: z.string(),
        status: z.enum(['accepted', 'pending', 'declined']),
      })),
      maxCapacity: z.number().optional(),
      isPublic: z.boolean(),
      registrationRequired: z.boolean(),
      tags: z.array(z.string()),
    }),
    prompt: 'Generate 4 diverse events for a corporate event calendar in January 2024. Include mix of virtual and physical events.',
  });

  console.log('Generated Events:\n');
  object.forEach((event, i) => {
    console.log(`${i + 1}. ${event.title} (${event.eventType})`);
    console.log(`   When: ${event.startTime}`);
    console.log(`   Where: ${event.location.venue} (${event.location.type})`);
    console.log(`   Organizer: ${event.organizer.name}`);
    console.log(`   Attendees: ${event.attendees.length}/${event.maxCapacity || 'unlimited'}`);
    console.log('');
  });
}

async function analyticsData() {
  console.log('\n=== Example 5: Generate Analytics Dashboard Data ===\n');

  const { object } = await generateObject({
    model: claude('sonnet'),
    schema: z.object({
      overview: z.object({
        totalUsers: z.number(),
        activeUsers: z.number(),
        newUsers: z.number(),
        revenue: z.number(),
        conversionRate: z.number(),
      }),
      trafficSources: z.array(z.object({
        source: z.string(),
        visitors: z.number(),
        percentage: z.number(),
      })),
      topPages: z.array(z.object({
        url: z.string(),
        pageTitle: z.string(),
        views: z.number(),
        avgTimeOnPage: z.number().describe('Seconds'),
        bounceRate: z.number().describe('Percentage'),
      })),
      userDemographics: z.object({
        ageGroups: z.array(z.object({
          range: z.string(),
          count: z.number(),
          percentage: z.number(),
        })),
        topCountries: z.array(z.object({
          country: z.string(),
          users: z.number(),
        })),
      }),
      timeSeriesData: z.array(z.object({
        date: z.string(),
        visits: z.number(),
        pageviews: z.number(),
        revenue: z.number(),
      })),
    }),
    prompt: 'Generate realistic analytics dashboard data for a SaaS application for the past 7 days. Include traffic sources, top pages, and user demographics.',
  });

  console.log('Analytics Dashboard Data:', JSON.stringify(object, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Total Users: ${object.overview.totalUsers.toLocaleString()}`);
  console.log(`Active Users: ${object.overview.activeUsers.toLocaleString()}`);
  console.log(`Revenue: $${object.overview.revenue.toLocaleString()}`);
  console.log(`Conversion Rate: ${object.overview.conversionRate}%`);
}

async function main() {
  try {
    await testDataGeneration();
    await mockAPIResponse();
    await databaseRecords();
    await eventCalendar();
    await analyticsData();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
