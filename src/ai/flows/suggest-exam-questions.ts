'use server';

/**
 * @fileOverview Exam question suggestion flow for English teachers in Algeria.
 *
 * - suggestExamQuestions - A function that suggests exam questions based on topic, difficulty, and curriculum.
 */

import {ai} from '@/ai/genkit';
import type {
  SuggestExamQuestionsInput,
  SuggestExamQuestionsOutput,
} from './suggest-exam-questions-types';
import {
  SuggestExamQuestionsInputSchema,
  SuggestExamQuestionsOutputSchema,
} from './suggest-exam-questions-types';

export async function suggestExamQuestions(
  input: SuggestExamQuestionsInput
): Promise<SuggestExamQuestionsOutput> {
  return suggestExamQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExamQuestionsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: SuggestExamQuestionsInputSchema},
  output: {schema: SuggestExamQuestionsOutputSchema},
  prompt: `You are an expert AI assistant tasked with creating high-quality, professional exams for {{#if isFrench}}French{{else}}English{{/if}} teachers in Algeria, strictly following the official Algerian education system's curriculum.

Generate exactly {{numberOfSuggestions}} distinct exam suggestions. Each suggestion must include a complete exam paper and a separate, detailed answer key. The difficulty and content must be perfectly adapted to the specified educational level, year, and trimester.

**Creativity Seed:** {{creativitySeed}} - Use this seed to ensure your response is unique and not a repeat of a previous answer.

**Educational Context:**
*   **Language:** {{#if isFrench}}French{{else}}English{{/if}}
*   **Level:** {{level}}
*   **Year:** {{year}}
*   **Trimester:** {{trimester}}
*   **Topic (if provided):** {{#if topic}}"{{topic}}"{{else}}N/A{{/if}}
*   **Keywords (if provided):** {{#if keywords}}"{{keywords}}"{{else}}N/A{{/if}}

**Crucial Instructions:**
1.  **Strictly Adhere to the Algerian Curriculum:** All content (texts, questions, exercises) must align with the official pedagogical program for the specified level, year, and trimester.
2.  **Include a Scoring Table (Barème de notation):** Every exam paper must include a detailed scoring table for each section.
3.  **Vary Question Types:** Ensure a mix of questions assessing reading comprehension, grammar, vocabulary, and writing skills.

---

**Suggestion 1: Comprehensive Exam (Épreuve de synthèse)**
*   **Description:** A traditional exam where students write answers on a separate paper.
*   **Content Must Include:**
    1.  A text for reading comprehension.
    2.  A series of questions based on the text.
    3.  Grammar and vocabulary exercises.
    4.  A writing section (production écrite).
*   **Formatting:** Professional and clean, ready for printing.

**Suggestion 2: On-Sheet Exam (Épreuve à remplir)**
*   **Description:** An exam designed for students to write answers directly on the sheet. It should be 2-3 pages long.
*   **Content Must Include:**
    1.  Sufficient empty space after each question for student answers.
    2.  Interactive elements like tables to fill in (e.g., verb conjugations, vocabulary matching), fill-in-the-blank questions, or multiple-choice questions.
*   **Formatting:** Well-structured with clear instructions and dedicated answer spaces.

---

For each of the two suggestions, provide:
1.  **examPaper**: The full exam paper, well-formatted in Markdown. If an image is relevant, use a placeholder like '![Image description](https://picsum.photos/seed/1/600/400)'. Use a different seed for each image.
2.  **answerKey**: A separate, complete, and detailed answer key ("corrigé type") for the teacher, also in Markdown.

The final output must be a JSON object that strictly follows this schema.
`,
});

const suggestExamQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestExamQuestionsFlow',
    inputSchema: SuggestExamQuestionsInputSchema,
    outputSchema: SuggestExamQuestionsOutputSchema,
  },
  async (input) => {
    const isFrench = input.language === 'fr';
    const creativitySeed = Math.random();
    const {output} = await prompt({...input, isFrench, creativitySeed});
    return output!;
  }
);
