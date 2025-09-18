'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestExamQuestions, type SuggestExamQuestionsInput, type SuggestExamQuestionsOutput } from '@/ai/flows/suggest-exam-questions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  topic: z.string().optional(),
  keywords: z.string().optional(),
  level: z.string({ required_error: 'Veuillez sélectionner un niveau.' }),
  year: z.string({ required_error: 'Veuillez sélectionner une année.' }),
  trimester: z.string({ required_error: 'Veuillez sélectionner un trimestre.' }),
  numberOfQuestions: z.coerce.number().int().min(1).max(10).default(5),
});

type FormValues = z.infer<typeof formSchema>;
type ExamSuggestion = SuggestExamQuestionsOutput['suggestions'][0];

export default function ExamSuggestionPage() {
  const [examSuggestions, setExamSuggestions] = useState<SuggestExamQuestionsOutput['suggestions']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      keywords: '',
      numberOfQuestions: 5,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setExamSuggestions([]);
    try {
      const result = await suggestExamQuestions({ ...data, numberOfSuggestions: 3 } as SuggestExamQuestionsInput);
      setExamSuggestions(result.suggestions);
      toast({
        title: 'Succès !',
        description: 'Vos suggestions d\'examen ont été générées.',
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

  const applySuggestion = (suggestion: ExamSuggestion) => {
    console.log("Applying suggestion:", suggestion);
    toast({
      title: `Suggestion '${suggestion.title}' appliquée`,
      description: "L'examen a été enregistré.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggestion d'Examen"
        description="Générez des examens complets sur mesure en quelques secondes."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>Paramètres de l'examen</CardTitle>
                    <CardDescription>Remplissez les détails pour générer les suggestions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Sujet (Optionnel)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: La Révolution Algérienne" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="keywords"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Mots-clés (Optionnel)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Histoire, Culture, Personnages" {...field} />
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
                            Générer les suggestions
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="min-h-full">
                <CardHeader>
                    <CardTitle>Suggestions d'examen</CardTitle>
                    <CardDescription>Voici les suggestions générées par l'IA. Choisissez-en une.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!isLoading && examSuggestions.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                            <p>Les suggestions d'examen apparaîtront ici.</p>
                            <p className="text-sm">Remplissez le formulaire et cliquez sur "Générer".</p>
                        </div>
                    )}
                    {examSuggestions.length > 0 && (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {examSuggestions.map((suggestion, index) => (
                                <AccordionItem value={`item-${index}`} key={index} className="border bg-secondary/30 rounded-lg px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex justify-between items-center w-full">
                                        <span className="font-semibold text-left">{suggestion.title}</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pt-2">
                                            <Tabs defaultValue="exam-paper" className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="exam-paper">Épreuve de l'examen</TabsTrigger>
                                                    <TabsTrigger value="answer-key">Corrigé</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="exam-paper">
                                                    <div className="prose prose-sm max-w-none dark:prose-invert bg-background/50 p-4 rounded-md border mt-2 min-h-60" dangerouslySetInnerHTML={{ __html: suggestion.examPaper.replace(/\\n/g, '<br />') }} />
                                                </TabsContent>
                                                <TabsContent value="answer-key">
                                                    <div className="prose prose-sm max-w-none dark:prose-invert bg-background/50 p-4 rounded-md border mt-2 min-h-60" dangerouslySetInnerHTML={{ __html: suggestion.answerKey.replace(/\\n/g, '<br />') }} />
                                                </TabsContent>
                                            </Tabs>
                                            <Button onClick={() => applySuggestion(suggestion)} className="w-full">
                                                Appliquer cette suggestion
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
