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
  prompt: `{{#if isFrench}}
Vous êtes un assistant IA conçu pour aider les professeurs de français en Algérie à créer des plans de cours professionnels et de haute qualité qui respectent strictement le système éducatif algérien.

Votre tâche est de générer un plan de cours complet et détaillé basé sur les informations fournies. Le plan doit être bien structuré, pédagogiquement solide et prêt à être mis en œuvre en classe.

**Contexte Éducatif :**
*   **Langue :** Français
*   **Niveau :** {{level}}
*   **Année :** {{year}}
*   **Trimestre :** {{trimester}}
*   **Sujet :** {{{topic}}}
*   **Nombre de Séances :** {{{numberOfClassMeetings}}}
{{#if prerequisiteKnowledge}}
*   **Connaissances Préalables :** {{{prerequisiteKnowledge}}}
{{/if}}

**Instructions Cruciales :**
1.  **Respect Strict du Programme Algérien :** Tout le contenu, les objectifs, les activités et les évaluations doivent être conformes au programme pédagogique officiel pour le niveau, l'année et le trimestre spécifiés.
2.  **Générer un Plan Complet :** Le plan de cours doit inclure des objectifs clairs, des activités centrées sur l'élève, le matériel nécessaire et des méthodes d'évaluation appropriées.
3.  **Intégrer des Outils Multimédias et Interactifs :** Pour améliorer la compréhension et l'engagement des élèves, intégrez divers outils pédagogiques dans le plan de cours.
    *   **Supports Visuels :** Incluez des suggestions d'images, de graphiques et de tableaux pertinents pour illustrer les concepts clés. Utilisez des placeholders Markdown comme \`![Image de...]\` pour les images et formatez clairement les tableaux.
    *   **Intégration Vidéo :** Lorsque cela est bénéfique, suggérez de courts extraits vidéo. Utilisez des placeholders comme \`[Vidéo expliquant...]\`.
    *   **Exemples Concrets :** Fournissez des exemples concrets et des cas d'utilisation pour rendre les concepts abstraits plus tangibles.
4.  **Formatage Professionnel :**
    *   Utilisez Markdown pour un formatage propre et professionnel.
    *   Utilisez des titres en gras et soulignés pour les sections principales (par exemple, **__Objectifs__**, **__Activités__**).
    *   Assurez une structure logique, un espacement adéquat et une hiérarchie claire pour une lecture facile et une utilisation directe.

Le résultat final doit être un seul plan de cours détaillé au format Markdown.

{{else}}
You are an AI assistant designed to help English teachers in Algeria create high-quality, professional lesson plans that strictly adhere to the Algerian education system.

Your task is to generate a comprehensive and detailed lesson plan based on the provided information. The plan must be well-structured, pedagogically sound, and ready for classroom implementation.

**Educational Context:**
*   **Language:** English
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
{{/if}}
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
    const {output} = await prompt({...input, isFrench});
    return output!;
  }
);
