"use client";

import { FormEvent, useState } from "react";
import type { Project } from "@/components/ProjectCard";

type AddProjectFormProps = {
  onCreated: (project: Project) => void;
};

export default function AddProjectForm({ onCreated }: AddProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setProjectUrl("");
    setTagsInput("");
    setImageFile(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!imageFile) {
      setError("يرجى رفع صورة للمشروع.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("project_url", projectUrl);
      formData.append("tags", tagsInput);
      formData.append("image", imageFile);

      const response = await fetch("/api/admin/projects", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string; project?: Project };

      if (!response.ok || !payload.project) {
        throw new Error(payload.error ?? "تعذر إنشاء المشروع.");
      }

      onCreated(payload.project);
      resetForm();
      setOpen(false);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "حدث خطأ ما.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card card-lift group flex w-full items-center gap-3 px-5 py-4 text-right anim-up"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--indigo)] transition-transform group-hover:scale-105">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-[var(--text-1)]">إضافة مشروع جديد</p>
          <p className="mt-0.5 text-xs text-[var(--text-3)]">انقر لفتح نموذج الإضافة</p>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-3)]">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="panel p-6 anim-up">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--indigo)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-1)]">مشروع جديد</h2>
            <p className="text-[11px] text-[var(--text-3)]">أضف مشروعك وشاركه مع الجميع</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-3)] transition-all hover:border-[var(--line-hover)] hover:text-[var(--text-1)]"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">اسم المشروع *</span>
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: متجر إلكتروني" className="field" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">رابط المشروع *</span>
            <input required type="url" value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} placeholder="https://example.com" className="field" dir="ltr" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">الوصف *</span>
          <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="صف مشروعك باختصار..." className="field resize-none" />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">الوسوم</span>
            <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="nextjs, react, typescript" className="field" dir="ltr" />
            <span className="text-[10px] text-[var(--text-3)]">افصل بين الوسوم بفاصلة</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">صورة المشروع *</span>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="field cursor-pointer text-xs file:ml-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--indigo-dim)] file:px-3 file:py-1 file:text-[10px] file:font-black file:text-[var(--indigo-light)]"
            />
          </label>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={isSubmitting} className="btn btn-indigo">
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                إضافة المشروع
              </>
            )}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost text-xs">
            إلغاء
          </button>
        </div>
      </div>
    </form>
  );
}
