
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import type { Student, Homework } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit } from 'lucide-react';

function HomeworkForm({ homework, onSave, onOpenChange }: { homework?: Homework, onSave: () => void, onOpenChange: (open: boolean) => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [title, setTitle] = useState(homework?.title || '');
    const [requiredBooks, setRequiredBooks] = useState(homework?.requiredBooks.join(', ') || '');

    const handleSubmit = async () => {
        if (!firestore) return;
        if (!title || !requiredBooks) {
            toast({ title: "Validation Error", description: "Please fill out all fields.", variant: "destructive" });
            return;
        }

        const booksArray = requiredBooks.split(',').map(book => book.trim()).filter(Boolean);

        const homeworkData = {
            title,
            requiredBooks: booksArray,
        };

        if (homework?.id) {
            // Update existing
            const homeworkRef = doc(firestore, 'homework', homework.id);
            await updateDocumentNonBlocking(homeworkRef, homeworkData);
            toast({ title: "Homework Updated", description: `${title} has been updated.` });
        } else {
            // Create new
            const homeworkCol = collection(firestore, 'homework');
            await addDocumentNonBlocking(homeworkCol, homeworkData);
            toast({ title: "Homework Created", description: `${title} has been added.` });
        }
        onSave();
        onOpenChange(false);
    };

    return (
        <div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Homework Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Week 5 - History & Math" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="books">Required Books (comma-separated)</Label>
                    <Input id="books" value={requiredBooks} onChange={(e) => setRequiredBooks(e.target.value)} placeholder="e.g., History Textbook, Math Workbook" />
                </div>
            </div>
            <DialogFooter className="mt-4">
                <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
        </div>
    );
}


function HomeworkManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const homeworkQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'homework'));
    }, [firestore]);
    const { data: homeworks, isLoading: areHomeworksLoading, refetch } = useCollection<Homework>(homeworkQuery);

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        if (confirm('Are you sure you want to delete this homework?')) {
            const homeworkRef = doc(firestore, 'homework', id);
            await deleteDocumentNonBlocking(homeworkRef);
            toast({ title: 'Homework Deleted', variant: 'destructive'});
            refetch(); // Trigger refetch
        }
    };
    
    const handleSave = () => {
        refetch();
        setIsDialogOpen(false);
    }

    if (areHomeworksLoading) {
        return <div>Loading homework...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Homework</CardTitle>
                        <CardDescription>Create, edit, or delete homework assignments.</CardDescription>
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Create New</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Homework</DialogTitle>
                            </DialogHeader>
                            <HomeworkForm onSave={handleSave} onOpenChange={setIsDialogOpen} />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {(homeworks || []).map(hw => (
                    <div key={hw.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <p className="font-semibold">{hw.title}</p>
                            <p className="text-sm text-muted-foreground">{hw.requiredBooks.join(', ')}</p>
                        </div>
                        <div className="flex gap-2">
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Homework</DialogTitle>
                                    </DialogHeader>
                                    <HomeworkForm homework={hw} onSave={handleSave} onOpenChange={() => {}}/>
                                </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(hw.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    </div>
                ))}
                {homeworks?.length === 0 && <p className="text-muted-foreground text-center">No homework assignments found.</p>}
            </CardContent>
        </Card>
    );
}

export default function SchedulePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<Student>(userDocRef);

  if (isUserLoading || isUserDocLoading || !user) {
    return <div>Loading...</div>;
  }

  const isTeacher = userData?.role === 'teacher';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Homework Schedule</h1>
        <p className="text-muted-foreground">Manage homework assignments for students.</p>
      </div>
      {isTeacher ? (
        <HomeworkManager />
      ) : (
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      )}
    </div>
  );
}
