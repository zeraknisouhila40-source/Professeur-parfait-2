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
import { Loader2, Printer, Copy } from 'lucide-react';
import { PdfHeader } from '@/components/pdf-header';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  level: z.string({ required_error: 'Please select a level.' }),
  year: z.string({ required_error: 'Please select a year.' }),
  trimester: z.string({ required_error: 'Please select a trimester.' }),
  quantity: z.coerce.number().int().min(1, { message: 'Must be at least 1.' }).max(10, { message: 'Cannot exceed 10.' }),
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
  
  const level = form.watch('level');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedExercises([]);
    try {
      const result = await generateHomeworkExercises(data as GenerateHomeworkExercisesInput);
      setGeneratedExercises(result.exercises);
      toast({
        title: 'Success!',
        description: 'Your exercises have been generated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while generating exercises. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('homework-exercises');
    if (printContent) {
      const header = document.getElementById('pdf-header-print');
      const headerHTML = header ? header.innerHTML : '';
      const contentHTML = printContent.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Print Homework</title>
        <style>
          body { font-family: 'PT Sans', sans-serif; }
          ol { list-style-type: decimal; padding-left: 20px; }
          li { margin-bottom: 10px; }
        </style>
        </head><body>${headerHTML}${contentHTML}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleCopy = () => {
    const textToCopy = generatedExercises.map((ex, index) => `${index + 1}. ${ex}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied!',
      description: "The exercises have been copied to the clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework Creation"
        description="Generate homework assignments tailored to your students' level."
      />
       <div className="hidden"><PdfHeader id="pdf-header-print" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Homework Parameters</CardTitle>
              <CardDescription>Fill in the details to generate exercises.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: The present subjunctive" {...field} />
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
                          <FormLabel>Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              <SelectItem value="Middle School">Middle School</SelectItem>
                              <SelectItem value="High School">High School</SelectItem>
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
                          <FormLabel>Year</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="1st year">1st year</SelectItem>
                                  <SelectItem value="2nd year">2nd year</SelectItem>
                                  <SelectItem value="3rd year">3rd year</SelectItem>
                                  {level === 'Middle School' && <SelectItem value="4th year">4th year (for middle school)</SelectItem>}
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
                          <FormLabel>Trimester</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select trimester" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              <SelectItem value="1st trimester">1st trimester</SelectItem>
                              <SelectItem value="2nd trimester">2nd trimester</SelectItem>
                              <SelectItem value="3rd trimester">3rd trimester</SelectItem>
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
                        <FormLabel>Skill Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
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
                        <FormLabel>Number of exercises</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Exercises
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Generated Exercises</CardTitle>
              <CardDescription>Here are the AI-generated homework exercises.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && generatedExercises.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                  <p>Generated exercises will appear here.</p>
                </div>
              )}
              {generatedExercises.length > 0 && (
                <div className="space-y-4">
                  <div id="homework-exercises">
                    <ol className="list-decimal list-outside space-y-3 pl-5">
                      {generatedExercises.map((ex, index) => (
                        <li key={index} className="bg-secondary/50 p-3 rounded-md pl-4">{ex}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
