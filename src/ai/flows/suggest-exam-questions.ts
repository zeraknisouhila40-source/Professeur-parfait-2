'use server';

/**
 * @fileOverview Exam question suggestion flow for English teachers in Algeria.
 *
 * - suggestExamQuestions - A function that suggests exam questions based on topic, difficulty, and curriculum.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  SuggestExamQuestionsInputSchema,
  type SuggestExamQuestionsInput,
  SuggestExamQuestionsOutputSchema,
  type SuggestExamQuestionsOutput,
} from './suggest-exam-questions-types';

export async function suggestExamQuestions(
  input: SuggestExamQuestionsInput
): Promise<SuggestExamQuestionsOutput> {
  return suggestExamQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExamQuestionsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {
    schema: SuggestExamQuestionsInputSchema.extend({
      isFrench: z.boolean(),
    }),
  },
  output: {schema: SuggestExamQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to help {{#if isFrench}}French{{else}}English{{/if}} teachers in Algeria create complete exams based on the Algerian education system.

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
  The questions must align with the Algerian curriculum for the educational level: {{level}}, {{year}}, for the {{trimester}}. The content must strictly follow the official Algerian pedagogical program for this specific level.

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
    const isFrench = input.language === 'fr';
    const {output} = await prompt({...input, isFrench});
    return output!;
  }
);
