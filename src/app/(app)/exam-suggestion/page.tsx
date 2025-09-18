'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestExamQuestions, type SuggestExamQuestionsInput } from '@/ai/flows/suggest-exam-questions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Le sujet doit contenir au moins 3 caractères.' }),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  curriculumAlignment: z.string().min(10, { message: 'Le programme doit contenir au moins 10 caractères.' }),
  numberOfQuestions: z.coerce.number().int().min(1, { message: 'Doit être au moins 1.' }).max(10, { message: 'Ne peut pas dépasser 10.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExamSuggestionPage() {
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      difficulty: 'medium',
      curriculumAlignment: 'Programme de français algérien pour le secondaire',
      numberOfQuestions: 5,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedQuestions([]);
    try {
      const result = await suggestExamQuestions(data as SuggestExamQuestionsInput);
      setGeneratedQuestions(result.questions);
      toast({
        title: 'Succès !',
        description: 'Vos questions ont été générées.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération des questions. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggestion d'Examen"
        description="Générez des questions d'examen sur mesure en quelques secondes."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>Paramètres de l'examen</CardTitle>
                    <CardDescription>Remplissez les détails pour générer les questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Sujet</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: La Révolution Algérienne" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Difficulté</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une difficulté" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="easy">Facile</SelectItem>
                                <SelectItem value="medium">Moyen</SelectItem>
                                <SelectItem value="hard">Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="curriculumAlignment"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Alignement Curriculaire</FormLabel>
                            <FormControl>
                                <Textarea rows={4} placeholder="Décrivez les normes du programme à respecter" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="numberOfQuestions"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nombre de questions</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" max="10" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Générer les questions
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="min-h-full">
                <CardHeader>
                    <CardTitle>Questions suggérées</CardTitle>
                    <CardDescription>Voici les questions générées par l'IA.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!isLoading && generatedQuestions.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                            <p>Les questions générées apparaîtront ici.</p>
                            <p className="text-sm">Remplissez le formulaire et cliquez sur "Générer".</p>
                        </div>
                    )}
                    {generatedQuestions.length > 0 && (
                        <div className="space-y-4">
                            <ol className="list-decimal list-outside space-y-3 pl-5">
                                {generatedQuestions.map((q, index) => (
                                    <li key={index} className="bg-secondary/50 p-3 rounded-md pl-4">{q}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
