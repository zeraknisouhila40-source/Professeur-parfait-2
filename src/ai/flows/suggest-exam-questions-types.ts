import {z} from 'genkit';

export const SuggestExamQuestionsInputSchema = z.object({
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

export const SuggestExamQuestionsOutputSchema = z.object({
  suggestions: z
    .array(ExamSuggestionSchema)
    .describe('An array of distinct exam suggestions, each with a title, a full exam paper, and a separate answer key.'),
});
export type SuggestExamQuestionsOutput = z.infer<
  typeof SuggestExamQuestionsOutputSchema
>;
