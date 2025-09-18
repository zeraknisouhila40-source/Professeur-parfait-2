'use server';

/**
 * @fileOverview Exam question suggestion flow for French teachers in Algeria.
 *
 * - suggestExamQuestions - A function that suggests exam questions based on topic, difficulty, and curriculum.
 * - SuggestExamQuestionsInput - The input type for the suggestExamQuestions function.
 * - SuggestExamQuestionsOutput - The return type for the suggestExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExamQuestionsInputSchema = z.object({
  topic: z.string().optional().describe('The topic for which to generate exam questions.'),
  keywords: z.string().optional().describe('Keywords to refine the exam questions.'),
  level: z.string().describe("The educational level (e.g., 'middle', 'secondary')."),
  year: z.string().describe("The year within the educational level (e.g., '1st year')."),
  trimester: z.string().describe("The trimester (e.g., '1st trimester')."),
  numberOfQuestions: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe('The number of exam questions to generate (up to 10).'),
  numberOfSuggestions: z.number().int().min(1).max(5).default(3).describe('The number of exam suggestions to generate.'),
});
export type SuggestExamQuestionsInput = z.infer<
  typeof SuggestExamQuestionsInputSchema
>;

const ExamSuggestionSchema = z.object({
  title: z.string().describe('A title for this exam suggestion.'),
  questions: z
    .array(z.string())
    .describe('An array of suggested exam questions.'),
});

const SuggestExamQuestionsOutputSchema = z.object({
  suggestions: z
    .array(ExamSuggestionSchema)
    .describe('An array of distinct exam suggestions, each with a title and a list of questions.'),
});
export type SuggestExamQuestionsOutput = z.infer<
  typeof SuggestExamQuestionsOutputSchema
>;

export async function suggestExamQuestions(
  input: SuggestExamQuestionsInput
): Promise<SuggestExamQuestionsOutput> {
  return suggestExamQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExamQuestionsPrompt',
  input: {schema: SuggestExamQuestionsInputSchema},
  output: {schema: SuggestExamQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to help French teachers in Algeria create exams.

  Generate {{numberOfSuggestions}} distinct exam suggestions.
  {{#if topic}}
  The suggestions should be on the topic of "{{topic}}".
  {{/if}}
  {{#if keywords}}
  The suggestions should incorporate the following keywords: "{{keywords}}".
  {{/if}}
  
  Each suggestion should have a unique title and {{numberOfQuestions}} questions.
  The questions should align with the Algerian curriculum for the educational level: {{level}}, {{year}}, for the {{trimester}}.

  Ensure that the questions are relevant, comprehensive, and appropriate for the specified educational level.

  Please provide the suggestions with titles and numbered lists of questions.
  `,
});

const suggestExamQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestExamQuestionsFlow',
    inputSchema: SuggestExamQuestionsInputSchema,
    outputSchema: SuggestExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
