"use client";

import { clearAdminTabToken, getAdminTabToken } from "@/services/adminTabSession";

import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { loginUser } from "@/services/authService";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-login-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-login-body",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-login-mono",
});

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="m22 8-10 6L2 8" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hasFailedLogin, setHasFailedLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const tabToken = getAdminTabToken();

    if (!tabToken) {
      setIsCheckingSession(false);
      return () => {
        isMounted = false;
      };
    }

    api
      .get("/auth/session")
      .then(() => {
        if (!isMounted) return;
        router.replace("/admin-dashboard");
      })
      .catch(() => {
        if (!isMounted) return;
        clearAdminTabToken();
        setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);


  const heading = hasFailedLogin
    ? "Yahh.. I Know You are not Shubham..🤨"
    : "Hey, are you Shubham..🧐";

  const eyebrow = hasFailedLogin
    ? "Identity mismatch"
    : "Private admin entry";

  const supportCopy = hasFailedLogin
    ? "Nice try. This private gate only opens for the real admin credentials."
    : "Your portfolio is live. This is the quiet control room behind it.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await loginUser({
        email: email.trim(),
        password,
      });

      router.push("/admin-dashboard");
    } catch {
      clearAdminTabToken();
      setHasFailedLogin(true);
      setError("Invalid credentials. Access denied.");
    } finally {

      setIsSubmitting(false);
    }
  };

  const pageClassName = cn(
    "login-page relative min-h-screen overflow-hidden bg-[#08111b] text-[#f5efe4] [font-family:var(--font-login-body),system-ui,sans-serif]",
    displayFont.variable,
    bodyFont.variable,
    monoFont.variable
  );

  if (isCheckingSession) {
    return (
      <main className={pageClassName}>
        <div className="login-grid absolute inset-0 opacity-25" />
        <div className="absolute left-[10%] top-[12%] h-64 w-64 rounded-full bg-[rgba(115,228,202,0.12)] blur-3xl login-float" />
        <div className="absolute right-[12%] top-[18%] h-56 w-56 rounded-full bg-[rgba(255,157,115,0.14)] blur-3xl login-float" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-8 py-7 text-center shadow-[0_30px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.38em] text-[#97a6b9] [font-family:var(--font-login-mono),monospace]">
              Checking Session
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[#f5efe4]">
              Hold on, verifying the admin door
            </h2>
          </div>
        </div>

        <style jsx global>{`
          .login-page h1,
          .login-page h2,
          .login-page h3 {
            font-family: var(--font-login-display), system-ui, sans-serif;
            letter-spacing: -0.04em;
          }

          .login-grid {
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
            background-size: 72px 72px;
            mask-image: radial-gradient(circle at center, black 30%, transparent 82%);
          }

          .login-float {
            animation: login-float 16s linear infinite;
          }

          @keyframes login-float {
            0% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(16px, -18px, 0) scale(1.05);
            }
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <>
      <main className={pageClassName}>
        <div className="login-grid absolute inset-0 opacity-25" />
        <div className="absolute left-[8%] top-[8%] h-72 w-72 rounded-full bg-[rgba(115,228,202,0.12)] blur-3xl login-float" />
        <div className="absolute right-[8%] top-[22%] h-64 w-64 rounded-full bg-[rgba(255,157,115,0.14)] blur-3xl login-float" />
        <div className="absolute bottom-[10%] left-[36%] h-60 w-60 rounded-full bg-[rgba(245,213,154,0.10)] blur-3xl login-float" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-14">
          <div className="w-full max-w-3xl text-center">
            <div
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.34em] [font-family:var(--font-login-mono),monospace]",
                hasFailedLogin
                  ? "border-[rgba(255,140,92,0.28)] bg-[rgba(255,140,92,0.10)] text-[#ffbeaa]"
                  : "border-[rgba(115,228,202,0.28)] bg-[rgba(115,228,202,0.10)] text-[#96ebd8]"
              )}
            >
              {eyebrow}
            </div>

            <h1
              key={hasFailedLogin ? "warning" : "default"}
              className={cn(
                "login-heading-pop mt-8 text-4xl font-semibold leading-tight sm:text-5xl lg:text-[4.25rem]",
                hasFailedLogin ? "text-[#ffcfbf]" : "text-[#f5efe4]"
              )}
            >
              {heading}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#97a6b9] sm:text-lg">
              {supportCopy}
            </p>
          </div>

          <div className="mt-10 w-full max-w-xl rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-[1px] shadow-[0_36px_110px_-50px_rgba(0,0,0,0.98)]">
            <div className="rounded-[33px] bg-[rgba(9,17,27,0.92)] p-6 backdrop-blur-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg font-semibold text-[#f5d59a]">
                    SK
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-[#97a6b9] [font-family:var(--font-login-mono),monospace]">
                      Admin Portal
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-[#f5efe4]">
                      Control Room
                    </h2>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    hasFailedLogin
                      ? "border-[rgba(255,140,92,0.28)] bg-[rgba(255,140,92,0.10)] text-[#ffbeaa]"
                      : "border-[rgba(115,228,202,0.24)] bg-[rgba(115,228,202,0.08)] text-[#96ebd8]"
                  )}
                >
                  {hasFailedLogin ? "Alert" : "Secure"}
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#97a6b9]">
                Use your private admin credentials to manage profiles, content, projects,
                and contact activity.
              </p>

              {error ? (
                <div className="mt-6 rounded-2xl border border-[rgba(255,140,92,0.28)] bg-[rgba(255,140,92,0.10)] px-4 py-3 text-sm text-[#ffcfbf]">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#f5efe4]">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a6b9]">
                      <MailIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="email"
                      autoFocus
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="username"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError("");
                      }}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-[#101a26] px-12 py-3.5 text-[#f5efe4] outline-none transition-all duration-300 placeholder:text-[#6f7f92] focus:border-[rgba(115,228,202,0.35)] focus:bg-[#12202d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#f5efe4]">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a6b9]">
                      <LockIcon className="h-5 w-5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError("");
                      }}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-[#101a26] px-12 py-3.5 pr-20 text-[#f5efe4] outline-none transition-all duration-300 placeholder:text-[#6f7f92] focus:border-[rgba(115,228,202,0.35)] focus:bg-[#12202d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#97a6b9] transition-colors hover:text-[#f5efe4]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70",
                    hasFailedLogin
                      ? "bg-[linear-gradient(135deg,#ffb58e,#ff8c5c)] text-[#1a0f0a] hover:-translate-y-0.5"
                      : "bg-[linear-gradient(135deg,#73e4ca,#ffb58e)] text-[#091017] hover:-translate-y-0.5"
                  )}
                >
                  {isSubmitting ? "Checking Identity..." : "Enter Admin Dashboard"}
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#97a6b9] [font-family:var(--font-login-mono),monospace]">
                    Access
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#f5efe4]">Admin only</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#97a6b9] [font-family:var(--font-login-mono),monospace]">
                    Session
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#f5efe4]">Secure cookie</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#97a6b9] [font-family:var(--font-login-mono),monospace]">
                    Scope
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#f5efe4]">Private controls</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .login-page h1,
        .login-page h2,
        .login-page h3 {
          font-family: var(--font-login-display), system-ui, sans-serif;
          letter-spacing: -0.04em;
        }

        .login-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at center, black 34%, transparent 82%);
        }

        .login-float {
          animation: login-float 16s linear infinite;
        }

        .login-heading-pop {
          animation: login-heading-pop 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes login-float {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(16px, -18px, 0) scale(1.05);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes login-heading-pop {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </>
  );
}
