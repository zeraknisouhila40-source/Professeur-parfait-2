'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateHomeworkExercises, type GenerateHomeworkExercisesInput } from '@/ai/flows/generate-homework-exercises';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Le sujet doit contenir au moins 3 caractères.' }),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  level: z.string({ required_error: 'Veuillez sélectionner un niveau.' }),
  year: z.string({ required_error: 'Veuillez sélectionner une année.' }),
  trimester: z.string({ required_error: 'Veuillez sélectionner un trimestre.' }),
  quantity: z.coerce.number().int().min(1, { message: 'Doit être au moins 1.' }).max(10, { message: 'Ne peut pas dépasser 10.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function HomeworkCreationPage() {
  const [generatedExercises, setGeneratedExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      skillLevel: 'intermediate',
      quantity: 3,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedExercises([]);
    try {
      const result = await generateHomeworkExercises(data as GenerateHomeworkExercisesInput);
      setGeneratedExercises(result.exercises);
      toast({
        title: 'Succès !',
        description: 'Vos exercices ont été générés.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération des exercices. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Création de Devoirs"
        description="Générez des devoirs à la maison adaptés au niveau de vos élèves."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Paramètres des devoirs</CardTitle>
              <CardDescription>Remplissez les détails pour générer les exercices.</CardDescription>
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
                          <Input placeholder="Ex: Le subjonctif présent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Niveau</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Choisir le niveau" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              <SelectItem value="Enseignement moyen">Enseignement moyen</SelectItem>
                              <SelectItem value="Enseignement secondaire">Enseignement secondaire</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Année</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Choisir l'année" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="1ère année">1ère année</SelectItem>
                                  <SelectItem value="2ème année">2ème année</SelectItem>
                                  <SelectItem value="3ème année">3ème année</SelectItem>
                                  <SelectItem value="4ème année">4ème année (pour le moyen)</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="trimester"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Trimestre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Choisir le trimestre" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              <SelectItem value="1er trimestre">1er trimestre</SelectItem>
                              <SelectItem value="2ème trimestre">2ème trimestre</SelectItem>
                              <SelectItem value="3ème trimestre">3ème trimestre</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="skillLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de Compétence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un niveau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Débutant</SelectItem>
                            <SelectItem value="intermediate">Intermédiaire</SelectItem>
                            <SelectItem value="advanced">Avancé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre d'exercices</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Générer les exercices
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Exercices générés</CardTitle>
              <CardDescription>Voici les exercices de devoirs générés par l'IA.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && generatedExercises.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                  <p>Les exercices générés apparaîtront ici.</p>
                </div>
              )}
              {generatedExercises.length > 0 && (
                <div className="space-y-4">
                  <ol className="list-decimal list-outside space-y-3 pl-5">
                    {generatedExercises.map((ex, index) => (
                      <li key={index} className="bg-secondary/50 p-3 rounded-md pl-4">{ex}</li>
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
