"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import SocialProviders from "./SocialProviders";
import { signIn, signUp, signInAndRedirect, signUpAndRedirect } from "@/lib/auth/actions";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
}

export default function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isSignUp = mode === "sign-up";
  const router = useRouter();

  // Safe redirect — only allow relative paths to prevent open redirect
  const safeRedirect = redirectTo?.startsWith("/") ? redirectTo : "/";

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      // Use server-side redirect variants — cookies + redirect in one response
      // guarantees the session cookie is present before the next page renders.
      const result = isSignUp
        ? await signUpAndRedirect(formData, safeRedirect)
        : await signInAndRedirect(formData, safeRedirect);

      // If we get here, the action returned an error (redirect throws, so it
      // never returns on success)
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const switchHref = isSignUp
    ? `/sign-in${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`
    : `/sign-up${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <div className="w-full flex flex-col">

      {/* 1. Top switch — centered, small */}
      <p className="text-center text-sm text-[#757575] mb-6">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href={switchHref} className="text-[#111] font-semibold underline underline-offset-2">
              Sign In
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href={switchHref} className="text-[#111] font-semibold underline underline-offset-2">
              Sign Up
            </Link>
          </>
        )}
      </p>

      {/* 2. Heading */}
      <div className="text-center mb-6">
        <h1 className="text-[26px] leading-[32px] font-bold text-[#111]">
          {isSignUp ? "Join Aero Today!" : "Welcome Back!"}
        </h1>
        <p className="mt-1 text-sm text-[#757575]">
          {isSignUp
            ? "Create your account to start your journey"
            : "Sign in to your account to continue"}
        </p>
      </div>

      {/* 3. Social buttons + divider */}
      <SocialProviders mode={mode} />

      {/* 4. Error banner */}
      {error && (
        <p role="alert" className="mb-3 text-sm text-[var(--color-red)] text-center">
          {error}
        </p>
      )}

      {/* 5. Form fields */}
      <form action={handleSubmit} className="flex flex-col gap-4 mt-1" noValidate>

        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-[#111]">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              required
              className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 text-sm text-[#111] placeholder:text-[#aaa] bg-white focus:outline-none focus:border-[#111] transition-colors"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#111]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="johndoe@gmail.com"
            required
            className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 text-sm text-[#111] placeholder:text-[#aaa] bg-white focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-[#111]">
              Password
            </label>
            {!isSignUp && (
              <Link href="#" className="text-xs text-[#757575] hover:text-[#111] transition-colors">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="minimum 8 characters"
              required
              className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 pr-12 text-sm text-[#111] placeholder:text-[#aaa] bg-white focus:outline-none focus:border-[#111] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#111] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#111] text-white font-semibold py-3.5 rounded-full text-sm hover:bg-[#333] transition-colors mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Please wait…" : isSignUp ? "Sign Up" : "Sign In"}
        </button>

      </form>

      {isSignUp && (
        <p className="mt-5 text-center text-xs text-[#aaa]">
          By signing up, you agree to our{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-[#111] transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-[#111] transition-colors">
            Privacy Policy
          </Link>
        </p>
      )}

    </div>
  );
}
