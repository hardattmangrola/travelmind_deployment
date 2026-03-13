/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "@/lib/auth-client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plane,
  UserCircle,
} from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

const rightPanelVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 18,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const logoVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M23.04 12.2615C23.04 11.4459 22.9669 10.6615 22.8306 9.90918H12V14.3576H18.1894C17.9222 15.7959 17.1116 17.0041 15.9034 17.8123V20.7137H19.5606C21.76 18.6615 23.04 15.7615 23.04 12.2615Z"
        fill="#4285F4"
      />
      <path
        d="M12 23.5C15.24 23.5 17.9572 22.4292 19.5606 20.7136L15.9034 17.8123C15.0397 18.3931 13.9531 18.7387 12 18.7387C8.87531 18.7387 6.22938 16.6706 5.28938 13.8298H1.51001V16.8179C3.10188 20.5656 7.19688 23.5 12 23.5Z"
        fill="#34A853"
      />
      <path
        d="M5.28938 13.8297C5.04188 13.2489 4.90125 12.6243 4.90125 11.9997C4.90125 11.3751 5.04188 10.7506 5.28938 10.1697V7.18164H1.51001C0.76875 8.66975 0.375 10.2943 0.375 11.9997C0.375 13.7051 0.76875 15.3297 1.51001 16.8178L5.28938 13.8297Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.26094C14.1216 5.26094 15.9897 6.00141 17.4253 7.36953L19.6622 5.11828C17.9522 3.23641 15.235 2 12 2C7.19688 2 3.10188 4.93453 1.51001 8.68228L5.28938 11.6703C6.22938 8.82953 8.87531 6.76094 12 5.26094Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: SignInValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });
      router.push("/dashboard");
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left visual panel */}
      <div className="relative hidden w-0 flex-1 overflow-hidden bg-slate-900 md:block">
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=90"
          alt="Aerial view of a coast and mountains"
          fill
          priority
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-indigo-900/70" />

        <div className="relative flex h-full flex-col justify-between px-12 py-10 text-white">
          <motion.div
            className="space-y-6"
            variants={logoVariants as any}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/90 shadow-sm">
                <Plane className="h-3.5 w-3.5" />
              </span>
              <span className="tracking-wide">TravelMind</span>
            </div>

            <div className="max-w-sm space-y-3">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Your next adventure starts here
              </h1>
              <p className="text-base text-slate-100/80">
                Join 50,000+ travelers planning smarter trips with AI.
              </p>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                AI Itineraries
              </div>
              <div className="rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                Real-time Collaboration
              </div>
              <div className="rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                Smart Budgeting
              </div>
            </div>

            <p className="text-xs text-slate-200/70">
              Trusted by travelers in 40+ countries.
            </p>
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <motion.div
        className="flex w-full items-center justify-center bg-white px-6 py-8 md:w-[45%] md:px-10 lg:px-14"
        variants={rightPanelVariants as any}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md">
          {/* Mobile top header with logo + thumbnails */}
          <div className="mb-8 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <Plane className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold text-slate-900">
                TravelMind
              </span>
            </div>
            <div className="flex gap-1.5">
              <img
                src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=200&q=60"
                alt="Tropical destination"
                className="h-8 w-12 rounded-lg object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1529758146491-1e11fd721f11?w=200&q=60"
                alt="City skyline"
                className="h-8 w-12 rounded-lg object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1559599101-7466fe601f50?w=200&q=60"
                alt="Mountain range"
                className="h-8 w-12 rounded-lg object-cover"
              />
            </div>
          </div>

          <motion.div
            className="space-y-1"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500">
              Sign in to continue planning your trips.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 mb-6 flex justify-center"
            variants={itemVariants}
          >
            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-100">
              <UserCircle className="h-9 w-9 text-white" />
            </div>
          </motion.div>

          <motion.form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-10 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password?.message && (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.password.message}
                </p>
              )}
              <div className="mt-1 text-right">
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.p
                variants={itemVariants}
                className="text-sm text-rose-500"
              >
                {error}
              </motion.p>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-indigo-100 transition hover:scale-[1.02] hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              variants={itemVariants}
            >
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                or continue with
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="button"
                onClick={() =>
                  signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  })
                }
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </motion.div>

            <motion.div
              className="pt-2 text-center text-sm text-slate-600"
              variants={itemVariants}
            >
              <span>Don&apos;t have an account? </span>
              <a
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Create one free
              </a>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

