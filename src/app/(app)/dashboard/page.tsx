'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarCheck,
  FileText,
  PenSquare,
  BookMarked,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';

const features = [
  {
    icon: FileText,
    titleKey: 'dashboard.features.examSuggestion.title',
    descriptionKey: 'dashboard.features.examSuggestion.description',
    href: '/exam-suggestion',
  },
  {
    icon: PenSquare,
    titleKey: 'dashboard.features.correctionAssistance.title',
    descriptionKey: 'dashboard.features.correctionAssistance.description',
    href: '/correction-assistance',
  },
  {
    icon: BookMarked,
    titleKey: 'dashboard.features.homeworkCreation.title',
    descriptionKey: 'dashboard.features.homeworkCreation.description',
    href: '/homework-creation',
  },
  {
    icon: CalendarCheck,
    titleKey: 'dashboard.features.lessonPlanning.title',
    descriptionKey: 'dashboard.features.lessonPlanning.description',
    href: '/lesson-planning',
  },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('dashboard.header.title')}
        description={t('dashboard.header.description')}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.href} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-headline text-lg">{t(feature.titleKey)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="text-muted-foreground flex-grow mb-4">{t(feature.descriptionKey)}</p>
              <Link href={feature.href} className="mt-auto">
                <Button className="w-full">
                  {t('common.getStarted')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
