'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestExamQuestions, type SuggestExamQuestionsInput, type SuggestExamQuestionsOutput } from '@/ai/flows/suggest-exam-questions';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from '@/hooks/use-translation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Printer, Copy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfHeader } from '@/components/pdf-header';


const formSchema = z.object({
  topic: z.string().optional(),
  keywords: z.string().optional(),
  level: z.string({ required_error: 'Please select a level.' }),
  year: z.string({ required_error: 'Please select a year.' }),
  trimester: z.string({ required_error: 'Please select a trimester.' }),
  numberOfQuestions: z.coerce.number().int().min(1).max(10).default(5),
});

type FormValues = z.infer<typeof formSchema>;
type ExamSuggestion = SuggestExamQuestionsOutput['suggestions'][0];

export default function ExamSuggestionPage() {
  const { t, language } = useTranslation();
  const [examSuggestions, setExamSuggestions] = useState<SuggestExamQuestionsOutput['suggestions']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      keywords: '',
      numberOfQuestions: 5,
    },
  });

  const levelValue = form.watch('level');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setExamSuggestions([]);
    try {
      const result = await suggestExamQuestions({ ...data, numberOfSuggestions: 2, language } as SuggestExamQuestionsInput);
      setExamSuggestions(result.suggestions);
      toast({
        title: t('examSuggestion.toast.success.title'),
        description: t('examSuggestion.toast.success.description'),
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

  const handleDownloadPdf = async (suggestion: ExamSuggestion, index: number) => {
    setIsDownloading(true);
    try {
      const examPaperElement = document.getElementById(`exam-paper-${index}`);
      const answerKeyElement = document.getElementById(`answer-key-${index}`);
      const headerElement = document.getElementById(`pdf-header-${index}`);

      if (!examPaperElement || !answerKeyElement || !headerElement) {
        toast({ title: t('common.error.title'), description: t('examSuggestion.toast.pdfError'), variant: 'destructive' });
        setIsDownloading(false);
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const addContentToPdf = async (element: HTMLElement, withHeader: boolean) => {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        let imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = imgHeight;
        let position = 0;

        if (withHeader) {
          const headerCanvas = await html2canvas(headerElement, { scale: 2 });
          const headerImgData = headerCanvas.toDataURL('image/png');
          const headerImgProps = pdf.getImageProperties(headerImgData);
          const headerImgHeight = (headerImgProps.height * pdfWidth) / headerImgProps.width;
          pdf.addImage(headerImgData, 'PNG', 0, 0, pdfWidth, headerImgHeight);
          position = headerImgHeight;
        }

        let page = 1;
        while (heightLeft > 0) {
          if(page > 1) {
             pdf.addPage();
          }
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
          position -= pdfHeight;
          page++;
        }
      };

      await addContentToPdf(examPaperElement, true);
      pdf.addPage();
      await addContentToPdf(answerKeyElement, false);
      
      pdf.save(`${suggestion.title.replace(/ /g, '_')}.pdf`);
      
      toast({ title: t('examSuggestion.toast.downloadSuccess.title'), description: t('examSuggestion.toast.downloadSuccess.description') });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: t('examSuggestion.toast.pdfError'), description: String(error), variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = (contentId: string) => {
    const printContent = document.getElementById(contentId);
    if (printContent) {
      const header = document.getElementById('pdf-header-print');
      const headerHTML = header ? header.innerHTML : '';
      const contentHTML = printContent.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Print</title>
        <style>
          body { font-family: 'PT Sans', sans-serif; }
          .prose { max-width: 100%; } 
          img { max-width: 100%; height: auto; }
          table { width: 100%; border-collapse: collapse; } 
          th, td { border: 1px solid #ccc; padding: 8px; }
        </style>
        </head><body>${headerHTML}${contentHTML}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: t('common.copied.title'),
      description: t('common.copied.description'),
    });
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title={t('examSuggestion.header.title')}
        description={t('examSuggestion.header.description')}
      />
      <div className="hidden"><PdfHeader id="pdf-header-print" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>{t('examSuggestion.form.title')}</CardTitle>
                    <CardDescription>{t('examSuggestion.form.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('examSuggestion.form.topic.label')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('examSuggestion.form.topic.placeholder')} {...field} />
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
                                <FormLabel>{t('examSuggestion.form.keywords.label')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('examSuggestion.form.keywords.placeholder')} {...field} />
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
                                <FormLabel>{t('examSuggestion.form.numberOfQuestions.label')}</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" max="10" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('examSuggestion.form.submit')}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="min-h-full">
                <CardHeader>
                    <CardTitle>{t('examSuggestion.results.title')}</CardTitle>
                    <CardDescription>{t('examSuggestion.results.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!isLoading && examSuggestions.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-96">
                            <p>{t('examSuggestion.results.placeholder1')}</p>
                            <p className="text-sm">{t('examSuggestion.results.placeholder2')}</p>
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
                                        <div className="hidden">
                                          <PdfHeader id={`pdf-header-${index}`} />
                                        </div>
                                        <div className="space-y-4 pt-2">
                                            <Tabs defaultValue="exam-paper" className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="exam-paper">{t('examSuggestion.results.tabs.examPaper')}</TabsTrigger>
                                                    <TabsTrigger value="answer-key">{t('examSuggestion.results.tabs.answerKey')}</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="exam-paper">
                                                    <div id={`exam-paper-${index}`} className="prose prose-sm max-w-none dark:prose-invert bg-background/50 p-4 rounded-md border mt-2 min-h-60" dangerouslySetInnerHTML={{ __html: getHtml(suggestion.examPaper) }} />
                                                    <div className="flex gap-2 mt-2">
                                                        <Button variant="outline" size="sm" onClick={() => handlePrint(`exam-paper-${index}`)}><Printer className="mr-2 h-4 w-4" /> {t('common.print')}</Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleCopy(suggestion.examPaper)}><Copy className="mr-2 h-4 w-4" /> {t('common.copy')}</Button>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="answer-key">
                                                    <div id={`answer-key-${index}`} className="prose prose-sm max-w-none dark:prose-invert bg-background/50 p-4 rounded-md border mt-2 min-h-60" dangerouslySetInnerHTML={{ __html: getHtml(suggestion.answerKey) }} />
                                                     <div className="flex gap-2 mt-2">
                                                        <Button variant="outline" size="sm" onClick={() => handlePrint(`answer-key-${index}`)}><Printer className="mr-2 h-4 w-4" /> {t('common.print')}</Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleCopy(suggestion.answerKey)}><Copy className="mr-2 h-4 w-4" /> {t('common.copy')}</Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                            <div className="flex gap-2 mt-4">
                                              <Button
                                                variant="outline"
                                                onClick={() => handleDownloadPdf(suggestion, index)}
                                                disabled={isDownloading}
                                                className="w-full"
                                              >
                                                {isDownloading ? (
                                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                  <Download className="mr-2 h-4 w-4" />
                                                )}
                                                {t('examSuggestion.results.downloadPdf')}
                                              </Button>
                                            </div>
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
