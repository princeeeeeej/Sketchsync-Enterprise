
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LoaderCircle,
} from "lucide-react";
import { BACKEND_URL } from "@/app/config";

export default function SignInPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get("content-type");
            let data: Record<string, unknown> = {};

            if (contentType?.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                if (text) data.message = text;
            }

            if (!response.ok) {
                setError(
                    typeof data.message === "string"
                        ? data.message
                        : typeof data.error === "string"
                          ? data.error
                          : "Login failed. Please check your email and password."
                );
                return;
            }

            // The backend sets the HttpOnly authentication cookie.
            // Do not store the token in localStorage.
            router.push("/");
            router.refresh();
        } catch (err) {
            console.error("Login error:", err);
            setError(
                "Unable to connect to the server. Check that your backend is running and CORS is configured."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#EDF3FF] p-3 sm:p-5 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:p-6">
            <div className="grid w-full max-w-[1240px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_25px_80px_rgba(65,91,150,0.15)] xl:h-full xl:max-h-[790px] xl:grid-cols-[0.95fr_1.05fr]">
                <section className="flex min-w-0 flex-col justify-center px-5 py-7 sm:px-9 sm:py-8 lg:mx-auto lg:w-full lg:max-w-[560px] lg:px-12 lg:py-6 xl:px-10 2xl:px-12">
                    <div className="mb-5 w-full text-center lg:mb-4">
                        <h1 className="whitespace-nowrap text-[clamp(2.2rem,3vw,3.2rem)] font-semibold leading-[0.99] tracking-[-0.075em] text-[#10182D]">
                            Welcome back to<br/>
                            <span className="text-[#1557FF]"> SketchSync.</span>
                        </h1>

                        <p className="mt-3 text-sm text-[#7A879F]">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="font-semibold text-[#1557FF] transition hover:text-[#0648ED]"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="mb-5 border-t border-[#D9E0EC] lg:mb-4" />

                    <div className="mb-5 lg:mb-4">
                        <p className="max-w-[390px] text-[13px] leading-5 text-[#7A879F] sm:text-sm sm:leading-6">
                            Pick up where your ideas left off.
                        </p>
                    </div>

                    <form
                        className="space-y-3 lg:space-y-2.5 xl:space-y-3"
                        onSubmit={handleLogin}
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-[13px] font-semibold text-[#20283A]"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="you@example.com"
                                className="h-11 w-full rounded-xl border border-[#D9E0EC] bg-white px-4 text-sm text-[#10182D] outline-none transition placeholder:text-[#9AA6BA] hover:border-[#B6C6E6] focus:border-[#1557FF] focus:ring-4 focus:ring-[#1557FF]/10"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-[13px] font-semibold text-[#20283A]"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    placeholder="Enter your password"
                                    className="h-11 w-full rounded-xl border border-[#D9E0EC] bg-white px-4 pr-12 text-sm text-[#10182D] outline-none transition placeholder:text-[#9AA6BA] hover:border-[#B6C6E6] focus:border-[#1557FF] focus:ring-4 focus:ring-[#1557FF]/10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71809B] hover:text-[#1557FF]"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-[#1557FF] transition hover:text-[#0648ED]"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1557FF] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(21,87,255,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0648ED] hover:shadow-[0_12px_24px_rgba(21,87,255,0.24)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            <span>
                                {isLoading ? "Signing in..." : "Sign in to your workspace"}
                            </span>

                            {isLoading ? (
                                <LoaderCircle size={19} className="animate-spin" />
                            ) : (
                                <ArrowRight
                                    size={19}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            )}
                        </button>
                    </form>
                </section>

                <section className="relative hidden min-h-0 overflow-hidden bg-[#E8F0FF] xl:block">
                    <Image
                        src="/sketchsync-whiteboard.png"
                        alt="SketchSync collaborative whiteboard with colorful notes and shared ideas"
                        fill
                        priority
                        sizes="(min-width: 1280px) 50vw, 100vw"
                        className="object-contain"
                    />
                </section>
            </div>
        </main>
    );
}
