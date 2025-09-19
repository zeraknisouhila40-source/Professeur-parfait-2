'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { correctAssignment, type CorrectAssignmentInput, type CorrectAssignmentOutput } from '@/ai/flows/automated-correction-assistance';
import { useTranslation } from '@/hooks/use-translation';

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
  level: z.string({ required_error: 'Please select a level.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CorrectionAssistancePage() {
  const { t, language } = useTranslation();
  const [correctionResult, setCorrectionResult] = useState<CorrectAssignmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentAssignment: '',
      examQuestions: '',
      topic: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setCorrectionResult(null);
    try {
      const result = await correctAssignment({ ...data, language } as CorrectAssignmentInput);
      setCorrectionResult(result);
      toast({
        title: t('correctionAssistance.toast.success.title'),
        description: t('correctionAssistance.toast.success.description'),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('common.error.title'),
        description: t('common.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('correctionAssistance.header.title')}
        description={t('correctionAssistance.header.description')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>{t('correctionAssistance.form.title')}</CardTitle>
              <CardDescription>{t('correctionAssistance.form.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentAssignment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('correctionAssistance.form.studentAssignment.label')}</FormLabel>
                        <FormControl>
                          <Textarea rows={8} placeholder={t('correctionAssistance.form.studentAssignment.placeholder')} {...field} />
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
                        <FormLabel>{t('common.level.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('common.level.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Middle School">{t('common.level.middleSchool')}</SelectItem>
                            <SelectItem value="High School">{t('common.level.highSchool')}</SelectItem>
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
                        <FormLabel>{t('correctionAssistance.form.examQuestions.label')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('correctionAssistance.form.examQuestions.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('correctionAssistance.form.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('correctionAssistance.results.title')}</CardTitle>
              <CardDescription>{t('correctionAssistance.results.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && !correctionResult && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                  <p>{t('correctionAssistance.results.placeholder')}</p>
                </div>
              )}
              {correctionResult && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('correctionAssistance.results.correctedAssignment')}</h3>
                    <p className="text-sm bg-secondary/50 p-4 rounded-md whitespace-pre-wrap">{correctionResult.correctedAssignment}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('correctionAssistance.results.identifiedErrors')}</h3>
                    <p className="text-sm bg-secondary/50 p-4 rounded-md whitespace-pre-wrap">{correctionResult.identifiedErrors}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('correctionAssistance.results.suggestedImprovements')}</h3>
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
