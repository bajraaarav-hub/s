'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { mainStudent } from '@/lib/data';
import { Backpack, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().min(1, { message: 'Please enter a login ID.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type Role = 'student' | 'teacher';

export default function LoginPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const handleSignIn = async (values: z.infer<typeof formSchema>, role: Role) => {
    if (!auth || !firestore) return;

    startTransition(async () => {
        try {
            const email = role === 'student' ? 'student@example.com' : 'teacher@example.com';
            const password = 'password';

            // Try to sign in
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (signInError: any) {
                // If user not found, create the user, then sign in
                if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const { uid } = userCredential.user;
                    const userRef = doc(firestore, 'users', uid);

                    let userData;
                    if (role === 'student') {
                        userData = { ...mainStudent, id: uid, email: email, name: 'Demo Student', role: 'student' };
                    } else {
                        userData = { id: uid, email: email, name: 'Demo Teacher', role: 'teacher', points: 0, streak: 0, avatarUrl: 'https://picsum.photos/seed/110/100/100' };
                    }
                    await setDocumentNonBlocking(userRef, userData, { merge: true });
                } else {
                    // Re-throw other sign-in errors
                    throw signInError;
                }
            }
            
            toast({ title: 'Sign in successful!' });
            router.push('/');

        } catch (error: any) {
            console.error(`Sign in failed:`, error);
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: "Couldn't sign in with prototype credentials. Please try again.",
            });
        }
    });
};


  const AuthForm = ({ role }: { role: Role }) => (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login ID</FormLabel>
              <FormControl>
                <Input placeholder="enter here" {...field} />
              </FormControl>
              
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="pt-4 space-y-2">
          <Button
            type="button"
            onClick={form.handleSubmit((values) => handleSignIn(values, role))}
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Backpack className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold font-headline">SmartBackpack</h1>
          </div>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="pt-4">
              <AuthForm role="student" />
            </TabsContent>
            <TabsContent value="teacher" className="pt-4">
              <AuthForm role="teacher" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
