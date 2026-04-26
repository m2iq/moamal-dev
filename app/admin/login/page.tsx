"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "تعذر تسجيل الدخول.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "تعذر تسجيل الدخول.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md space-y-6 anim-up">
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--text-3)]">Admin Access</p>
          <h1 className="mt-2 text-3xl font-black tracking-tighter text-[var(--text-1)]">دخول الإدارة</h1>
          <p className="mt-2 text-sm text-[var(--text-3)]">هذه الصفحة خاصة. أدخل كلمة المرور للمتابعة.</p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="panel space-y-4 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</div>
          ) : null}

          <button type="submit" disabled={isSubmitting} className="btn btn-indigo w-full justify-center text-sm">
            {isSubmitting ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </main>
  );
}
