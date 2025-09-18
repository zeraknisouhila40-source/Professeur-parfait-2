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
  topic: z.string().describe('The topic for which to generate exam questions.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the exam questions.'),
  curriculumAlignment: z
    .string()
    .describe('The specific Algerian curriculum standards to align with.'),
  numberOfQuestions: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)    
    .describe('The number of exam questions to generate (up to 10).'),
});
export type SuggestExamQuestionsInput = z.infer<
  typeof SuggestExamQuestionsInputSchema
>;

const SuggestExamQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('An array of suggested exam questions.'),
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

  Generate {{numberOfQuestions}} exam questions on the topic of "{{topic}}". The difficulty level should be {{difficulty}}, and the questions should align with the following Algerian curriculum standards: {{curriculumAlignment}}.

  Ensure that the questions are relevant, comprehensive, and appropriate for the specified difficulty level and curriculum.

  Please provide the questions in a numbered list.
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
