"use client";

import { useState } from 'react';
import { loginUser } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser({ email, password });
      // If successful, where should we send you?
      router.push('/admin-dashboard');
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <form onSubmit={handleSubmit} className="p-8 bg-slate-900 rounded-lg border border-slate-800 w-96">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Portal 🔐</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 rounded bg-slate-800 text-white border border-slate-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-6 rounded bg-slate-800 text-white border border-slate-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold">
          Enter
        </button>
      </form>
    </main>
  );
}