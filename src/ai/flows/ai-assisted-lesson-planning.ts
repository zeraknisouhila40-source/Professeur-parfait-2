'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI-assisted lesson planning for English teachers in Algeria.
 *
 * The flow, aiAssistedLessonPlanning, helps generate lesson plans based on specified topics, number of class meetings,
 * and students' prerequisite knowledge.
 *
 * @fileOverview
 * - `aiAssistedLessonPlanning`: Asynchronously generates a lesson plan.
 * - `AiAssistedLessonPlanningInput`: Defines the input schema for the lesson planning flow.
 * - `AiAssistedLessonPlanningOutput`: Defines the output schema for the lesson plan flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedLessonPlanningInputSchema = z.object({
  topic: z.string().describe('The topic of the lesson plan.'),
  numberOfClassMeetings: z
    .number()
    .describe('The desired number of class meetings for the lesson plan.'),
  prerequisiteKnowledge: z
    .string()
    .optional()
    .describe(
      "The students' existing knowledge and skills related to the topic."
    ),
  level: z.string().describe("The educational level (e.g., 'middle', 'secondary')."),
  year: z.string().describe("The year within the educational level (e.g., '1st year')."),
  trimester: z.string().describe("The trimester (e.g., '1st trimester')."),
});
export type AiAssistedLessonPlanningInput = z.infer<
  typeof AiAssistedLessonPlanningInputSchema
>;

const AiAssistedLessonPlanningOutputSchema = z.object({
  lessonPlan: z
    .string()
    .describe(
      'A detailed lesson plan including objectives, activities, and assessments, formatted in Markdown.'
    ),
});
export type AiAssistedLessonPlanningOutput = z.infer<
  typeof AiAssistedLessonPlanningOutputSchema
>;

export async function aiAssistedLessonPlanning(
  input: AiAssistedLessonPlanningInput
): Promise<AiAssistedLessonPlanningOutput> {
  return aiAssistedLessonPlanningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedLessonPlanningPrompt',
  input: {schema: AiAssistedLessonPlanningInputSchema},
  output: {schema: AiAssistedLessonPlanningOutputSchema},
  prompt: `You are an AI assistant designed to help English teachers in Algeria create effective lesson plans based on the Algerian education system.

  Based on the topic, number of class meetings, and prerequisite knowledge provided, generate a comprehensive lesson plan that includes clear objectives, engaging activities, and appropriate assessments.

  Topic: {{{topic}}}
  Level: {{{level}}}
  Year: {{{year}}}
  Trimester: {{{trimester}}}
  Number of Class Meetings: {{{numberOfClassMeetings}}}
  {{#if prerequisiteKnowledge}}
  Prerequisite Knowledge: {{{prerequisiteKnowledge}}}
  {{/if}}

  Ensure the lesson plan is well-structured and aligned with the Algerian educational guidelines for teaching English.

  Output the lesson plan in a detailed, easy-to-understand format using Markdown.
  Use bold and underlined titles for main sections (e.g., **__Objectives__**).
  Use appropriate spacing and line breaks to ensure readability.
  Structure the plan logically with a clear hierarchy.
  `,
});

const aiAssistedLessonPlanningFlow = ai.defineFlow(
  {
    name: 'aiAssistedLessonPlanningFlow',
    inputSchema: AiAssistedLessonPlanningInputSchema,
    outputSchema: AiAssistedLessonPlanningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
