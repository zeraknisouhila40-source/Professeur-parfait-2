'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiAssistedLessonPlanning, type AiAssistedLessonPlanningInput } from '@/ai/flows/ai-assisted-lesson-planning';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

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
  topic: z.string().min(3, { message: 'Le sujet doit contenir au moins 3 caractères.' }),
  numberOfClassMeetings: z.coerce.number().int().min(1, { message: 'Doit être au moins 1.' }).max(20, { message: 'Ne peut pas dépasser 20.' }),
  prerequisiteKnowledge: z.string().optional(),
  level: z.string({ required_error: 'Veuillez sélectionner un niveau.' }),
  year: z.string({ required_error: 'Veuillez sélectionner une année.' }),
  trimester: z.string({ required_error: 'Veuillez sélectionner un trimestre.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LessonPlanningPage() {
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
        toast({ title: 'Erreur', description: "Impossible de trouver le contenu du plan de leçon.", variant: 'destructive' });
        setIsDownloading(false);
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const addContentToPdf = async (element: HTMLElement, withHeader: boolean) => {
        let position = 0;
        if (withHeader) {
          const headerCanvas = await html2canvas(headerElement, { scale: 2 });
          const headerImgData = headerCanvas.toDataURL('image/png');
          const headerImgProps = pdf.getImageProperties(headerImgData);
          const headerImgHeight = (headerImgProps.height * pdfWidth) / headerImgProps.width;
          pdf.addImage(headerImgData, 'PNG', 0, 0, pdfWidth, headerImgHeight);
          position = headerImgHeight;
        }

        const canvas = await html2canvas(element, { scale: 2, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        let imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = imgHeight;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= (pdfHeight - position);

        let page = 1;
        while (heightLeft > 0) {
            pdf.addPage();
            page++;
            const yPos = -(pdfHeight * (page-1)) + position;
            pdf.addImage(imgData, 'PNG', 0, yPos, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
      };

      await addContentToPdf(lessonPlanElement, true);
      pdf.save(`Plan_de_leçon_${form.getValues('topic').replace(/ /g, '_')}.pdf`);
      
      toast({ title: 'Téléchargement réussi', description: 'Le PDF du plan de leçon a été téléchargé.' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: 'Erreur de téléchargement', description: 'Une erreur est survenue lors de la création du PDF.', variant: 'destructive' });
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
        printWindow.document.write(`<html><head><title>Imprimer le Plan de Leçon</title>
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
        title: 'Copié !',
        description: "Le plan de leçon a été copié dans le presse-papiers.",
      });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Planification de Leçon"
        description="Créez des plans de cours détaillés avec l'aide de l'IA."
      />
      <div className="hidden">
        <PdfHeader id="pdf-header-lesson" />
      </div>
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
                        <FormLabel>Connaissances préalables (Optionnel)</FormLabel>
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
                      Télécharger en PDF
                    </Button>
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
                    <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copier</Button>
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
