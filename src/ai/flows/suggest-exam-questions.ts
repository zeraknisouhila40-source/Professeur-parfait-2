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
  examPaper: z.string().describe('The complete exam paper, including questions, scoring tables, and image placeholders if necessary. Use Markdown for formatting.'),
  answerKey: z.string().describe('The corresponding answer key for the exam paper, formatted for the teacher. Use Markdown for formatting.'),
});

const SuggestExamQuestionsOutputSchema = z.object({
  suggestions: z
    .array(ExamSuggestionSchema)
    .describe('An array of distinct exam suggestions, each with a title, a full exam paper, and a separate answer key.'),
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
  prompt: `You are an AI assistant designed to help French teachers in Algeria create complete exams.

  Generate {{numberOfSuggestions}} distinct exam suggestions.
  {{#if topic}}
  The suggestions should be on the topic of "{{topic}}".
  {{/if}}
  {{#if keywords}}
  The suggestions should incorporate the following keywords: "{{keywords}}".
  {{/if}}
  
  Each suggestion should have a unique title and a complete exam paper with {{numberOfQuestions}} questions.
  The questions should align with the Algerian curriculum for the educational level: {{level}}, {{year}}, for the {{trimester}}.

  For each suggestion, provide two parts:
  1.  **examPaper**: The full exam paper, ready to be given to students. It should be well-formatted using Markdown. Include tables for scoring points for each exercise. If an image is relevant, use a Markdown placeholder like '![Description for image]'.
  2.  **answerKey**: A separate, complete answer key for the teacher, also formatted in Markdown.

  Ensure that the content is relevant, comprehensive, and appropriate for the specified educational level.
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
