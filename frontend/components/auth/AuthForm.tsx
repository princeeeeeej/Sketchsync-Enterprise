"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { BACKEND_URL } from "@/app/config";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface AuthFormProps {
  isSignIn: boolean;
}

export function AuthForm({ isSignIn }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!email || !password || (!isSignIn && !username)) {
        setError("Please fill out all required fields.");
        return;
      }

      setError("");
      setLoading(true);

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/auth/${isSignIn ? "signin" : "signup"}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email,
              password,
              ...(isSignIn ? {} : { username }),
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", "cookie-auth");
          localStorage.setItem("user", JSON.stringify(data));
          router.push("/");
        } else {
          setError(
            data.message || "Authentication failed. Please check your credentials."
          );
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError("Unable to connect to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, username, isSignIn, router]
  );

  return (
    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
      <div className="auth-form-item mb-6">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-3">
          <span className="w-5 h-px bg-stone-300" />
          {isSignIn ? "Welcome Back" : "Get Started"}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 leading-tight">
          {isSignIn ? (
            <>
              Sign in to your <span className="text-[#e85d4c]">canvas</span>
            </>
          ) : (
            <>
              Create your <span className="text-[#e85d4c]">workspace</span>
            </>
          )}
        </h1>
        <p className="text-sm text-stone-500 mt-2 max-w-md">
          Real-time whiteboarding for modern teams. Draw, brainstorm, and bring
          ideas to life together.
        </p>
      </div>

      {error && (
        <div className="auth-form-item mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSignIn && (
          <div className="auth-form-item">
            <Input
              label="Username"
              type="text"
              placeholder="e.g. alex_design"
              leftIcon={<User size={16} />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="auth-form-item">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-form-item">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-stone-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>

        <div className="auth-form-item pt-2">
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            isLoading={loading}
            rightIcon={<ArrowRight size={16} />}
            className="w-full shadow-[0_8px_30px_rgba(28,25,23,0.18)]"
          >
            {isSignIn ? "Sign In to SketchSync" : "Create Account"}
          </Button>
        </div>
      </form>

      <div className="auth-form-item mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500">
          {isSignIn ? "Don't have an account?" : "Already a member?"}
        </span>
        <Link
          href={isSignIn ? "/signup" : "/signin"}
          className="font-bold text-[#e85d4c] hover:underline"
        >
          {isSignIn ? "Register for free" : "Sign in to account"}
        </Link>
      </div>
    </div>
  );
}
