'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { correctAssignment, type CorrectAssignmentInput, type CorrectAssignmentOutput } from '@/ai/flows/automated-correction-assistance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  studentAssignment: z.string().min(20, { message: 'Student assignment must be at least 20 characters.' }),
  examQuestions: z.string().optional(),
  topic: z.string().optional(),
  level: z.enum(['primary', 'secondary', 'elementary']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CorrectionAssistancePage() {
  const [correctionResult, setCorrectionResult] = useState<CorrectAssignmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentAssignment: '',
      examQuestions: '',
      topic: '',
      level: 'secondary',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setCorrectionResult(null);
    try {
      const result = await correctAssignment(data as CorrectAssignmentInput);
      setCorrectionResult(result);
      toast({
        title: 'Correction Complete!',
        description: 'The correction has been successfully generated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred during correction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Correction Assistance"
        description="Submit a student's work to get AI-assisted correction."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Submit Assignment</CardTitle>
              <CardDescription>Provide the details of the assignment to be corrected.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentAssignment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Assignment</FormLabel>
                        <FormControl>
                          <Textarea rows={8} placeholder="Paste the student's assignment text here..." {...field} />
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
                        <FormLabel>Educational Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="elementary">Elementary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="examQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Questions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the corresponding exam questions..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Correct Assignment
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correction Results</CardTitle>
              <CardDescription>Here is the AI-generated analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && !correctionResult && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                  <p>The correction results will appear here.</p>
                </div>
              )}
              {correctionResult && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Corrected Assignment</h3>
                    <p className="text-sm bg-secondary/50 p-4 rounded-md whitespace-pre-wrap">{correctionResult.correctedAssignment}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Identified Errors</h3>
                    <p className="text-sm bg-secondary/50 p-4 rounded-md whitespace-pre-wrap">{correctionResult.identifiedErrors}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Suggested Improvements</h3>
                    <p className="text-sm bg-secondary/50 p-4 rounded-md whitespace-pre-wrap">{correctionResult.suggestedImprovements}</p>
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
