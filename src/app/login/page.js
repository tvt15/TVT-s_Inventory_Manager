// app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup, signInWithEmailAndPassword , createUserWithEmailAndPassword} from '../../firebase';
import styles from './login.module.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/');  // Redirect to the homepage after sign-in
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');  // Redirect to the homepage after sign-in
    } catch (error) {
      console.error('Error signing in with Email/Password', error);
    }
  };
  const handleEmailPasswordSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');  // Redirect to the homepage after sign-in
    } catch (error) {
      console.error('Error signing up with Email/Password', error);
      setError(error.message); 
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
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.h2}>Sign In</h2>
        <form onSubmit={handleEmailPasswordSignIn}>
        {error && <p className={styles.p}>{error}</p>}
          <input className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button className={styles.button} type="submit">Sign in</button>
          <button className={styles.button} onClick={handleEmailPasswordSignUp}>Sign Up</button>
        </form>

        <div className={styles.dividerContainer}>
        <h3 className={styles.dividerText}>Or</h3>
        </div>
        <div className={styles.googleButton} onClick={handleGoogleSignIn}>
          <img src="/google-logo.png" alt="Google Sign-In" />
        </div>
      </div>
    </div>
  );
}
