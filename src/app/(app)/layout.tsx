'use client';
import React, { useState, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useTranslation, LanguageProvider } from '@/hooks/use-translation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pen } from 'lucide-react';


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage, teacherName, setTeacherName } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if(isMounted) {
      setName(teacherName);
    }
  }, [teacherName, isMounted]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameSave = () => {
    setTeacherName(name);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave();
    }
    if (e.key === 'Escape') {
      setName(teacherName);
      setIsEditingName(false);
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
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
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <Image src="https://picsum.photos/seed/prof/40/40" width={40} height={40} alt="Avatar" data-ai-hint="teacher portrait" />
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              {isEditingName ? (
                <div className="space-y-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    className="h-7 text-sm"
                    placeholder={t('common.teacherName')}
                  />
                  <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as 'en' | 'fr')}
                  >
                    <SelectTrigger className="h-7 text-xs text-muted-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-start"
                >
                  <div 
                    className="flex items-center gap-2 cursor-pointer group p-1"
                    onClick={() => setIsEditingName(true)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(true)}
                    tabIndex={0}
                    role="button"
                    aria-label="Edit teacher name"
                  >
                    <span className="text-sm font-medium">{teacherName}</span>
                    <Pen className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-muted-foreground px-1">{language === 'en' ? 'English' : 'Français'}</span>
                </div>
              )}
            </div>
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
