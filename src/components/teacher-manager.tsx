'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation, type Teacher } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, UserPlus, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeacherManagerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function TeacherManager({ isOpen, onOpenChange }: TeacherManagerProps) {
  const { t, teachers, activeTeacher, addTeacher, updateTeacher, deleteTeacher } = useTranslation();
  const [editingTeacher, setEditingTeacher] = useState<Partial<Teacher> | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setEditingTeacher({ name: '', language: 'en' });
  };
  
  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher({...teacher});
  };

  const handleDelete = (id: string) => {
    if (teachers.length > 1) {
      deleteTeacher(id);
    } else {
      toast({
        variant: "destructive",
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer le seul enseignant.",
      })
    }
  };

  const handleSave = () => {
    if (editingTeacher?.name) {
      if (editingTeacher.id) {
        updateTeacher(editingTeacher.id, { name: editingTeacher.name, language: editingTeacher.language });
      } else {
        addTeacher({ name: editingTeacher.name, language: editingTeacher.language || 'en' });
      }
      setEditingTeacher(null);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('teacherManager.title')}</DialogTitle>
          <DialogDescription>{t('teacherManager.description')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('teacherManager.active')}</TableHead>
                <TableHead>{t('teacherManager.name')}</TableHead>
                <TableHead>{t('teacherManager.language')}</TableHead>
                <TableHead className="text-right">{t('teacherManager.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    {activeTeacher?.id === teacher.id && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.language === 'en' ? 'English' : 'Français'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('teacherManager.deleteConfirm')}</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(teacher.id)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={handleAddNew}>
            <UserPlus className="mr-2 h-4 w-4" /> {t('teacherManager.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={!!editingTeacher} onOpenChange={(isOpen) => !isOpen && setEditingTeacher(null)}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>{editingTeacher?.id ? t('teacherManager.form.editTitle') : t('teacherManager.form.addTitle')}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('teacherManager.form.nameLabel')}</Label>
                    <Input 
                        id="name" 
                        placeholder={t('teacherManager.form.namePlaceholder')} 
                        value={editingTeacher?.name || ''} 
                        onChange={(e) => setEditingTeacher(prev => ({...prev, name: e.target.value}))}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="language">{t('teacherManager.form.languageLabel')}</Label>
                     <Select
                        value={editingTeacher?.language || 'en'}
                        onValueChange={(value) => setEditingTeacher(prev => ({...prev, language: value as 'en' | 'fr'}))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('teacherManager.form.languagePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
           </div>
           <DialogFooter>
                <Button variant="outline" onClick={() => setEditingTeacher(null)}>{t('teacherManager.form.cancel')}</Button>
                <Button onClick={handleSave}>{t('teacherManager.form.save')}</Button>
           </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
