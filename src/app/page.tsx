import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Flame, Users, BarChart3 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">cync</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cync-green" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-cync-green hover:bg-cync-green-muted text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 max-w-4xl mx-auto">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cync-green/30 bg-cync-green/10 text-emerald-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cync-green" />
          <span>Social fitness accountability</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          Stay consistent.
          <br />
          <span className="text-muted-foreground font-semibold">Stay connected.</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Track your workouts, share progress with your people, and stay accountable together.
          No algorithms, no influencer clutter, just real consistency.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg bg-cync-green hover:bg-cync-green-muted text-white font-medium text-sm transition-all shadow-md shadow-emerald-500/10 active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg border border-border bg-card/60 hover:bg-muted text-foreground font-medium text-sm transition-colors"
          >
            Login to Cync
          </Link>
        </div>

        {/* 3 Core Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-cync-green">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Track</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Log workouts in under a minute with sets, reps, notes, and optional photo proof.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Connect</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Private squads where you and your friends keep each other showing up every day.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Progress</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clear streak calculations, consistency metrics, and shared squad challenges.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">cync</span>
            <span>— Stay consistent. Stay connected.</span>
          </div>
          <p>© {new Date().getFullYear()} Cync. Minimal fitness accountability.</p>
        </div>
      </footer>
    </div>
  );
}
