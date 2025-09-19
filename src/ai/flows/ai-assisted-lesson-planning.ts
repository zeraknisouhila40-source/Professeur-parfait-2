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
import type {
  AiAssistedLessonPlanningInput,
  AiAssistedLessonPlanningOutput,
} from './ai-assisted-lesson-planning-types';
import {
  AiAssistedLessonPlanningInputSchema,
  AiAssistedLessonPlanningOutputSchema,
} from './ai-assisted-lesson-planning-types';

export async function aiAssistedLessonPlanning(
  input: AiAssistedLessonPlanningInput
): Promise<AiAssistedLessonPlanningOutput> {
  return aiAssistedLessonPlanningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedLessonPlanningPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: AiAssistedLessonPlanningInputSchema},
  output: {schema: AiAssistedLessonPlanningOutputSchema},
  prompt: `You are an AI assistant designed to help {{#if isFrench}}French{{else}}English{{/if}} teachers in Algeria create high-quality, professional lesson plans that strictly adhere to the Algerian education system.

Your task is to generate a comprehensive and detailed lesson plan based on the provided information. The plan must be well-structured, pedagogically sound, and ready for classroom implementation.

**Educational Context:**
*   **Language:** {{#if isFrench}}French{{else}}English{{/if}}
*   **Level:** {{level}}
*   **Year:** {{year}}
*   **Trimester:** {{trimester}}
*   **Topic:** {{{topic}}}
*   **Number of Class Meetings:** {{{numberOfClassMeetings}}}
{{#if prerequisiteKnowledge}}
*   **Prerequisite Knowledge:** {{{prerequisiteKnowledge}}}
{{/if}}

**Crucial Instructions:**
1.  **Strictly Adhere to the Algerian Curriculum:** All content, objectives, activities, and assessments must align with the official pedagogical program for the specified level, year, and trimester.
2.  **Generate a Comprehensive Plan:** The lesson plan must include clear objectives, engaging student-centered activities, necessary materials, and appropriate assessment methods.
3.  **Incorporate Multimedia and Interactive Tools:** To enhance student comprehension and engagement, integrate various pedagogical tools into the lesson plan.
    *   **Visual Aids:** Include suggestions for relevant images, charts, and tables to illustrate key concepts. Use Markdown placeholders like \`![Image of...]\` for images and format tables clearly.
    *   **Video Integration:** Where beneficial, suggest short video clips. Use placeholders like \`[Video explaining...]\`.
    *   **Concrete Examples:** Provide concrete examples and use cases to make abstract concepts more tangible.
4.  **Professional Formatting:**
    *   Use Markdown for clean and professional formatting.
    *   Use bold and underlined titles for main sections (e.g., **__Objectives__**, **__Activities__**).
    *   Ensure logical structure, proper spacing, and a clear hierarchy for easy readability and direct use.

The final output must be a single, detailed lesson plan in Markdown format.
  `,
});

const aiAssistedLessonPlanningFlow = ai.defineFlow(
  {
    name: 'aiAssistedLessonPlanningFlow',
    inputSchema: AiAssistedLessonPlanningInputSchema,
    outputSchema: AiAssistedLessonPlanningOutputSchema,
  },
  async (input) => {
    const isFrench = input.language === 'fr';
    const {output} = await prompt(input, {isFrench});
    return output!;
  }
);
