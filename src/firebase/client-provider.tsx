'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Initialize Firebase once at the module level, before any components render.
// This ensures the services are available synchronously and avoids race conditions.
const { firebaseApp, auth, firestore } = initializeFirebase();

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // The services are now guaranteed to be initialized, so we can pass them directly.
  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
