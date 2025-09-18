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
    title: "Suggestion d'Examen",
    description: "Générez des questions d'examen basées sur des sujets, des difficultés et des programmes spécifiques.",
    href: '/exam-suggestion',
  },
  {
    icon: PenSquare,
    title: 'Aide à la Correction',
    description: "Obtenez une assistance automatisée pour corriger les devoirs et identifier les erreurs courantes.",
    href: '/correction-assistance',
  },
  {
    icon: BookMarked,
    title: 'Création de Devoirs',
    description: 'Créez des exercices personnalisés adaptés à différents niveaux de compétence et sujets.',
    href: '/homework-creation',
  },
  {
    icon: CalendarCheck,
    title: 'Planification de Leçon',
    description: "Planifiez des cours complets avec des objectifs, des activités et des évaluations clairs.",
    href: '/lesson-planning',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Bienvenue, Professeur !"
        description="Professeur Parfait est votre assistant IA pour simplifier la préparation de vos cours de français."
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
                  Commencer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
