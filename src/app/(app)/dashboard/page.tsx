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

const features = [
  {
    icon: FileText,
    title: "Exam Suggestion",
    description: "Generate exam questions based on specific topics, difficulties, and curricula.",
    href: '/exam-suggestion',
  },
  {
    icon: PenSquare,
    title: 'Correction Assistance',
    description: "Get automated assistance to correct homework and identify common errors.",
    href: '/correction-assistance',
  },
  {
    icon: BookMarked,
    title: 'Homework Creation',
    description: 'Create customized exercises tailored to different skill levels and topics.',
    href: '/homework-creation',
  },
  {
    icon: CalendarCheck,
    title: 'Lesson Planning',
    description: "Plan complete lessons with clear objectives, activities, and assessments.",
    href: '/lesson-planning',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome, Professor!"
        description="Perfect Professor is your AI assistant to simplify preparing your English classes."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="text-muted-foreground flex-grow mb-4">{feature.description}</p>
              <Link href={feature.href} className="mt-auto">
                <Button className="w-full">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
