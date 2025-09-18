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

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/exam-suggestion', icon: FileText, label: "Suggestion d'Examen" },
  { href: '/correction-assistance', icon: PenSquare, label: 'Aide à la Correction' },
  { href: '/homework-creation', icon: BookMarked, label: 'Création de Devoirs' },
  { href: '/lesson-planning', icon: CalendarCheck, label: 'Planification de Leçon' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
