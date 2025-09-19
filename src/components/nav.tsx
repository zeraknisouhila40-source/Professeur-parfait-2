'use client';

import {
  CalendarCheck,
  FileText,
  LayoutDashboard,
  PenSquare,
  BookMarked,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/use-translation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/exam-suggestion', icon: FileText, labelKey: 'nav.examSuggestion' },
  { href: '/correction-assistance', icon: PenSquare, labelKey: 'nav.correctionAssistance' },
  { href: '/homework-creation', icon: BookMarked, labelKey: 'nav.homeworkCreation' },
  { href: '/lesson-planning', icon: CalendarCheck, labelKey: 'nav.lessonPlanning' },
];

export function Nav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={t(item.labelKey)}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{t(item.labelKey)}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
