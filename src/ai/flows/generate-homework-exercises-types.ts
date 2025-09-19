import {z} from 'genkit';

export const GenerateHomeworkExercisesInputSchema = z.object({
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

export const GenerateHomeworkExercisesOutputSchema = z.object({
  exercises: z.array(z.string()).describe('An array of homework exercises tailored to the specified topic and skill level.'),
});
export type GenerateHomeworkExercisesOutput = z.infer<typeof GenerateHomeworkExercisesOutputSchema>;
