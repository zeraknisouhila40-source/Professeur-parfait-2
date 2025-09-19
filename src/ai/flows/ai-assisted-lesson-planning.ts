'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI-assisted lesson planning for English teachers in Algeria.
 *
 * The flow, aiAssistedLessonPlanning, helps generate lesson plans based on specified topics, number of class meetings,
 * and students' prerequisite knowledge.
 *
 * @fileOverview
 * - `aiAssistedLessonPlanning`: Asynchronously generates a lesson plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  AiAssistedLessonPlanningInputSchema,
  type AiAssistedLessonPlanningInput,
  AiAssistedLessonPlanningOutputSchema,
  type AiAssistedLessonPlanningOutput,
} from './ai-assisted-lesson-planning-types';

export async function aiAssistedLessonPlanning(
  input: AiAssistedLessonPlanningInput
): Promise<AiAssistedLessonPlanningOutput> {
  return aiAssistedLessonPlanningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedLessonPlanningPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {
    schema: AiAssistedLessonPlanningInputSchema.extend({
      isFrench: z.boolean(),
    }),
  },
  output: {schema: AiAssistedLessonPlanningOutputSchema},
  prompt: `You are an AI assistant designed to help {{#if isFrench}}French{{else}}English{{/if}} teachers in Algeria create effective lesson plans based on the Algerian education system.

  Based on the topic, number of class meetings, and prerequisite knowledge provided, generate a comprehensive lesson plan that includes clear objectives, engaging activities, and appropriate assessments.

  Topic: {{{topic}}}
  Level: {{{level}}}
  Year: {{{year}}}
  Trimester: {{{trimester}}}
  Number of Class Meetings: {{{numberOfClassMeetings}}}
  {{#if prerequisiteKnowledge}}
  Prerequisite Knowledge: {{{prerequisiteKnowledge}}}
  {{/if}}

  Ensure the lesson plan is well-structured and aligned with the Algerian educational guidelines for teaching {{#if isFrench}}French{{else}}English{{/if}}.

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
    const isFrench = input.language === 'fr';
    const {output} = await prompt({...input, isFrench});
    return output!;
  }
);
