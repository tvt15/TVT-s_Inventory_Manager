// app/login/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup } from '../../firebase';

export default function SignIn() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/');  // Redirect to a protected page after sign-in
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <h2>Sign In</h2>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}
