import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to My Portfolio</h1>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xl text-slate-400">
          I am a Backend Developer specializing in Java and Spring Boot.
        </p>
        <p className="mt-4 text-slate-500 italic">
          (The admin entry is hidden for security)
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {/* We will eventually map your Java Backend "Projects" here */}
        <div className="p-6 border border-slate-700 rounded-xl bg-slate-800/50">
          <h2 className="text-xl font-semibold mb-2">Projects 🚀</h2>
          <p className="text-sm text-slate-400">View my latest work and contributions.</p>
        </div>
      </div>
    </main>
  );
}