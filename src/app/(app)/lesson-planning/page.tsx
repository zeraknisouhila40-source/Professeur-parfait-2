'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiAssistedLessonPlanning, type AiAssistedLessonPlanningInput } from '@/ai/flows/ai-assisted-lesson-planning';
import jsPDF from 'jspdf';
import { marked } from 'marked';
import { useTranslation } from '@/hooks/use-translation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Printer, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfHeader } from '@/components/pdf-header';


const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  numberOfClassMeetings: z.coerce.number().int().min(1, { message: 'Must be at least 1.' }).max(20, { message: 'Cannot exceed 20.' }),
  prerequisiteKnowledge: z.string().optional(),
  level: z.string({ required_error: 'Please select a level.' }),
  year: z.string({ required_error: 'Please select a year.' }),
  trimester: z.string({ required_error: 'Please select a trimester.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LessonPlanningPage() {
  const { t, language } = useTranslation();
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numberOfClassMeetings: 3,
      prerequisiteKnowledge: '',
    },
  });

  const levelValue = form.watch('level');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setLessonPlan(null);
    try {
      const result = await aiAssistedLessonPlanning({ ...data, language } as AiAssistedLessonPlanningInput);
      setLessonPlan(result.lessonPlan);
      toast({
        title: t('lessonPlanning.toast.success.title'),
        description: t('lessonPlanning.toast.success.description'),
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

  const getHtml = (markdown: string) => {
    try {
        return marked(markdown);
    } catch (e) {
        console.error("Error parsing markdown", e);
        return markdown;
    }
  }

  const handleDownloadPdf = async () => {
    if (!lessonPlan) return;
    setIsDownloading(true);

    try {
      const lessonPlanElement = document.getElementById('lesson-plan');
      const headerElement = document.getElementById('pdf-header-lesson');

      if (!lessonPlanElement || !headerElement) {
        toast({ title: t('common.error.title'), description: t('lessonPlanning.toast.pdfError'), variant: 'destructive' });
        setIsDownloading(false);
        return;
      }
      
      const pdf = new jsPDF('p', 'pt', 'a4');
      const safeFont = 'Helvetica';
      pdf.setFont(safeFont);
      
      const combinedHtml = `
        <div style="font-family: ${safeFont}; color: black; width: 525pt; padding: 35pt;">
          ${headerElement.innerHTML}
          ${lessonPlanElement.innerHTML}
        </div>
      `;

      await pdf.html(combinedHtml, {
        callback: function (doc) {
          doc.save(`Lesson_Plan_${form.getValues('topic').replace(/ /g, '_')}.pdf`);
        },
        html2canvas: {
          scale: 0.7
        },
        autoPaging: 'text',
        margin: [40, 40, 40, 40]
      });

      toast({ title: t('lessonPlanning.toast.downloadSuccess.title'), description: t('lessonPlanning.toast.downloadSuccess.description') });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: t('lessonPlanning.toast.pdfError'), description: String(error), variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };


  const handlePrint = () => {
    const printContent = document.getElementById('lesson-plan');
    if (printContent) {
      const header = document.getElementById('pdf-header-lesson');
      const headerHTML = header ? header.innerHTML : '';
      const contentHTML = printContent.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Print Lesson Plan</title>
        <style>
          body { font-family: 'PT Sans', sans-serif; }
          .prose { max-width: 100%; }
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
    if (lessonPlan) {
      navigator.clipboard.writeText(lessonPlan);
      toast({
        title: t('common.copied.title'),
        description: t('common.copied.description'),
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="hidden">
        <PdfHeader id="pdf-header-lesson" />
      </div>
      <PageHeader
        title={t('lessonPlanning.header.title')}
        description={t('lessonPlanning.header.description')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>{t('lessonPlanning.form.title')}</CardTitle>
              <CardDescription>{t('lessonPlanning.form.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('lessonPlanning.form.topic.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('lessonPlanning.form.topic.placeholder')} {...field} />
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
                      name="year"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>{t('common.year.label')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder={t('common.year.placeholder')} />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="1st year">{t('common.year.1st')}</SelectItem>
                                  <SelectItem value="2nd year">{t('common.year.2nd')}</SelectItem>
                                  <SelectItem value="3rd year">{t('common.year.3rd')}</SelectItem>
                                  {levelValue === 'Middle School' && <SelectItem value="4th year">{t('common.year.4th')}</SelectItem>}
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
                          <FormLabel>{t('common.trimester.label')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder={t('common.trimester.placeholder')} />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1st trimester">{t('common.trimester.1st')}</SelectItem>
                                <SelectItem value="2nd trimester">{t('common.trimester.2nd')}</SelectItem>
                                <SelectItem value="3rd trimester">{t('common.trimester.3rd')}</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfClassMeetings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('lessonPlanning.form.sessions.label')}</FormLabel>
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
                        <FormLabel>{t('lessonPlanning.form.prerequisites.label')}</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder={t('lessonPlanning.form.prerequisites.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('lessonPlanning.form.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>{t('lessonPlanning.results.title')}</CardTitle>
              <CardDescription>{t('lessonPlanning.results.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && !lessonPlan && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                  <p>{t('lessonPlanning.results.placeholder')}</p>
                </div>
              )}
              {lessonPlan && (
                <div className="space-y-4">
                  <div id="lesson-plan" className="prose prose-sm max-w-none dark:prose-invert bg-secondary/50 p-4 rounded-md border" dangerouslySetInnerHTML={{ __html: getHtml(lessonPlan) }} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {t('lessonPlanning.results.downloadPdf')}
                    </Button>
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> {t('common.print')}</Button>
                    <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> {t('common.copy')}</Button>
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
