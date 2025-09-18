'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiAssistedLessonPlanning, type AiAssistedLessonPlanningInput } from '@/ai/flows/ai-assisted-lesson-planning';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Le sujet doit contenir au moins 3 caractères.' }),
  numberOfClassMeetings: z.coerce.number().int().min(1, { message: 'Doit être au moins 1.' }).max(20, { message: 'Ne peut pas dépasser 20.' }),
  prerequisiteKnowledge: z.string().min(10, { message: 'Les prérequis doivent contenir au moins 10 caractères.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LessonPlanningPage() {
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numberOfClassMeetings: 3,
      prerequisiteKnowledge: 'Les élèves connaissent les verbes de base et la structure des phrases simples.',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setLessonPlan(null);
    try {
      const result = await aiAssistedLessonPlanning(data as AiAssistedLessonPlanningInput);
      setLessonPlan(result.lessonPlan);
      toast({
        title: 'Succès !',
        description: 'Votre plan de leçon a été généré.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du plan de leçon. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planification de Leçon"
        description="Créez des plans de cours détaillés avec l'aide de l'IA."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Paramètres de la leçon</CardTitle>
              <CardDescription>Remplissez les détails pour générer le plan de leçon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet de la leçon</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: L'imparfait et le passé composé" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfClassMeetings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de séances</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prerequisiteKnowledge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connaissances préalables</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="Décrivez ce que les élèves savent déjà..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Générer le plan de leçon
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Plan de leçon généré</CardTitle>
              <CardDescription>Voici le plan de leçon détaillé généré par l'IA.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && !lessonPlan && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                  <p>Le plan de leçon généré apparaîtra ici.</p>
                </div>
              )}
              {lessonPlan && (
                <div className="prose prose-sm max-w-none dark:prose-invert bg-secondary/50 p-4 rounded-md">
                   <pre className="text-wrap text-sm bg-transparent p-0 font-sans">{lessonPlan}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
