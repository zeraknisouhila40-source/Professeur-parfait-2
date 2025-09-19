'use client';
import React, { useState, useEffect } from 'react';
import { Nav } from '@/components/nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { useTranslation, LanguageProvider } from '@/hooks/use-translation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, UserPlus, Settings } from 'lucide-react';
import { TeacherManager } from '@/components/teacher-manager';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { t, activeTeacher, teachers, setActiveTeacherId } = useTranslation();
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !activeTeacher) {
    // You can return a loading skeleton here if you want
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
              <Icons.logo />
            </Button>
            <h2 className="text-lg font-semibold font-headline group-data-[collapsible=icon]:hidden">Perfect Professor</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Nav />
        </SidebarContent>
        <SidebarFooter>
            <div className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:px-2">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-2">
                       <div className='flex items-center gap-2'>
                         <Avatar className="h-7 w-7">
                            <Image src="https://picsum.photos/seed/prof/40/40" width={40} height={40} alt="Avatar" data-ai-hint="teacher portrait" />
                            <AvatarFallback>{activeTeacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="group-data-[collapsible=icon]:hidden">{activeTeacher.name}</span>
                       </div>
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="top" align="start">
                    <DropdownMenuLabel>{t('nav.switchTeacher')}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={activeTeacher.id} onValueChange={setActiveTeacherId}>
                        {teachers.map(teacher => (
                             <DropdownMenuRadioItem key={teacher.id} value={teacher.id}>{teacher.name}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onSelect={() => setIsManagerOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('nav.manageTeachers')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Future global search bar can be placed here */}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
      <TeacherManager isOpen={isManagerOpen} onOpenChange={setIsManagerOpen} />
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </LanguageProvider>
  )
}
