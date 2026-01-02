'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { mainStudent } from '@/lib/data';
import { Backpack } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async (role: 'student' | 'teacher') => {
    if (!auth || !firestore) return;

    try {
      const userCredential = await signInAnonymously(auth);
      const { uid, email } = userCredential.user;

      const userRef = doc(firestore, 'users', uid);
      let userData;

      if (role === 'student') {
        userData = { ...mainStudent, id: uid, email: email || 'anonymous@example.com', name: 'Anonymous Panda', role: 'student' };
      } else {
        userData = { id: uid, email: email || 'teacher@example.com', name: 'Teacher', role: 'teacher', points: 0, streak: 0 };
      }
      
      await setDocumentNonBlocking(userRef, userData, { merge: true });
      router.push('/');
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Backpack className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold font-headline">SmartBackpack</h1>
            </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Choose your role to continue</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button className="w-full" onClick={() => handleSignIn('student')}>
            Sign In as a Student
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => handleSignIn('teacher')}>
            Sign In as a Teacher
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
