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
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exam-suggestion', icon: FileText, label: "Exam Suggestion" },
  { href: '/correction-assistance', icon: PenSquare, label: 'Correction Assistance' },
  { href: '/homework-creation', icon: BookMarked, label: 'Homework Creation' },
  { href: '/lesson-planning', icon: CalendarCheck, label: 'Lesson Planning' },
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
