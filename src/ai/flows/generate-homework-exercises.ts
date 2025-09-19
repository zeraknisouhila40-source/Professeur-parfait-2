'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating tailored homework exercises for English language teachers in Algeria.
 *
 * It includes:
 * - generateHomeworkExercises: The main function to generate homework exercises.
 * - GenerateHomeworkExercisesInput: The input type for the generateHomeworkExercises function.
 * - GenerateHomeworkExercisesOutput: The output type for the generateHomeworkExercises function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHomeworkExercisesInputSchema = z.object({
  topic: z.string().describe('The specific topic covered in class for which homework is needed.'),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The skill level of the students for whom the homework is intended.'),
  level: z.string().describe("The educational level (e.g., 'middle', 'secondary')."),
  year: z.string().describe("The year within the educational level (e.g., '1st year')."),
  trimester: z.string().describe("The trimester (e.g., '1st trimester')."),
  quantity: z.number().min(1).max(10).default(3).describe('The desired number of homework exercises.'),
  curriculumGuidelines: z
    .string()
    .default('Algerian Ministry of Education curriculum guidelines')
    .describe('The curriculum guidelines to align the homework with.'),
    language: z.enum(['en', 'fr']).describe('The language for the exercises.'),
});
export type GenerateHomeworkExercisesInput = z.infer<typeof GenerateHomeworkExercisesInputSchema>;

const GenerateHomeworkExercisesOutputSchema = z.object({
  exercises: z.array(z.string()).describe('An array of homework exercises tailored to the specified topic and skill level.'),
});
export type GenerateHomeworkExercisesOutput = z.infer<typeof GenerateHomeworkExercisesOutputSchema>;

const FlowInputSchema = GenerateHomeworkExercisesInputSchema.extend({
  isFrench: z.boolean().optional(),
});

export async function generateHomeworkExercises(input: GenerateHomeworkExercisesInput): Promise<GenerateHomeworkExercisesOutput> {
  return generateHomeworkExercisesFlow({
    ...input,
    isFrench: input.language === 'fr',
  });
}

const prompt = ai.definePrompt({
  name: 'generateHomeworkExercisesPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: FlowInputSchema},
  output: {schema: GenerateHomeworkExercisesOutputSchema},
  prompt: `You are an AI assistant designed to help {{#if isFrench}}French{{else}}English{{/if}} teachers in Algeria create homework exercises according to the Algerian education system.

  Generate {{quantity}} homework exercises for the topic: {{topic}}.
  The exercises should be appropriate for students at the {{level}} level, in their {{year}}, during the {{trimester}}.
  The exercises should be appropriate for students with a {{skillLevel}} skill level.
  Align the exercises with the following curriculum guidelines: {{curriculumGuidelines}}.

  Ensure that each exercise is clear, concise, and directly related to the specified topic and skill level.
  Each exercise should be something a teacher could give to a student as homework.
  Return the homework exercises as a numbered list. 

  Exercises:
`,
});

const generateHomeworkExercisesFlow = ai.defineFlow(
  {
    name: 'generateHomeworkExercisesFlow',
    inputSchema: FlowInputSchema,
    outputSchema: GenerateHomeworkExercisesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
