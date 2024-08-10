// app/sign-up/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup } from '../../firebase';

export default function SignUp() {
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/');  // Redirect to a protected page after sign-up
    } catch (error) {
      console.error('Error signing up with Google', error);
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
      <h2>Sign Up</h2>
      <button onClick={handleGoogleSignUp}>Sign up with Google</button>
    </div>
  );
}
