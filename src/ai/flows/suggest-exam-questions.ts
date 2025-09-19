'use server';

/**
 * @fileOverview Exam question suggestion flow for English teachers in Algeria.
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
  numberOfSuggestions: z.number().int().min(1).max(5).default(2).describe('The number of exam suggestions to generate.'),
  language: z.enum(['en', 'fr']).describe('The language for the exam.'),
});
export type SuggestExamQuestionsInput = z.infer<
  typeof SuggestExamQuestionsInputSchema
>;

const ExamSuggestionSchema = z.object({
  title: z.string().describe('A title for this exam suggestion.'),
  examPaper: z.string().describe("The complete exam paper, including questions, scoring tables, and image placeholders if necessary. Use Markdown for formatting. For images, use ![Image description](https://picsum.photos/seed/1/600/400) and change the seed for different images."),
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
  prompt: `You are an AI assistant designed to help {{language === 'fr' ? 'French' : 'English'}} teachers in Algeria create complete exams based on the Algerian education system.

  Generate exactly {{numberOfSuggestions}} distinct exam suggestions. Each suggestion must include a complete exam paper and a separate answer key.

  **First Suggestion (Comprehensive Exam - "Épreuve de synthèse"):**
  This exam should be a comprehensive composition exam, designed for students to write their answers on a separate paper. It must include:
  1.  A text for reading comprehension.
  2.  A series of questions based on the text.
  3.  Grammar and vocabulary exercises.
  4.  A writing section (expression écrite).
  
  **Second Suggestion (Fill-in-the-blanks Exam - "Épreuve à remplir"):**
  This exam should be an "on-sheet" test where students write their answers directly in the spaces provided. It must be 2-3 pages long and include:
  1.  Ample empty space for answers after each question.
  2.  Tables for students to fill in (e.g., verb conjugations, vocabulary matching).
  3.  Fill-in-the-blank questions or multiple-choice questions.

  {{#if topic}}
  The suggestions should be on the topic of "{{topic}}".
  {{/if}}
  {{#if keywords}}
  The suggestions should incorporate the following keywords: "{{keywords}}".
  {{/if}}

  Each suggestion must have a unique and descriptive title (e.g., "Épreuve de Synthèse sur..." or "Examen à Remplir sur...").
  The questions must align with the Algerian curriculum for the educational level: {{level}}, {{year}}, for the {{trimester}}.

  For each of the two suggestions, provide two distinct parts:
  1.  **examPaper**: The full exam paper, well-formatted using Markdown, ready to be given to students. It must include scoring tables for each section (barème de notation). If an image is relevant, use a Markdown placeholder like '![Image description](https://picsum.photos/seed/1/600/400)'. Use a different seed for each image.
  2.  **answerKey**: A separate, complete, and detailed answer key ("corrigé") for the teacher, also formatted in Markdown.

  The final output must be a JSON object that strictly follows this schema:
  
  {
    "suggestions": [
      {
        "title": "Title of the comprehensive exam",
        "examPaper": "## Comprehensive Exam\\n...",
        "answerKey": "## Answer Key for Comprehensive Exam\\n..."
      },
      {
        "title": "Title of the fill-in-the-blank exam",
        "examPaper": "## Fill-in-the-blank Exam\\n...",
        "answerKey": "## Answer Key for Fill-in-the-blank Exam\\n..."
      }
    ]
  }
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
