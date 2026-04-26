"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddProjectForm from "@/components/AddProjectForm";
import type { Project } from "@/components/ProjectCard";

type EditableState = {
  title: string;
  description: string;
  project_url: string;
  tagsInput: string;
  imageFile: File | null;
};

function mapProjectToEditable(project: Project): EditableState {
  return {
    title: project.title,
    description: project.description,
    project_url: project.project_url,
    tagsInput: (project.tags ?? []).join(", "),
    imageFile: null,
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editable, setEditable] = useState<EditableState | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/admin/projects", { cache: "no-store" });
        const payload = (await response.json()) as { error?: string; projects?: Project[] };

        if (!response.ok) {
          throw new Error(payload.error ?? "تعذر تحميل المشاريع.");
        }

        setProjects(payload.projects ?? []);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "تعذر تحميل المشاريع.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setError("");
      const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "تعذر حذف المشروع.");
      }

      setProjects((previous) => previous.filter((project) => project.id !== id));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "تعذر حذف المشروع.";
      setError(message);
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditable(mapProjectToEditable(project));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditable(null);
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault();

    if (!editable) {
      return;
    }

    try {
      setError("");
      const formData = new FormData();
      formData.append("title", editable.title);
      formData.append("description", editable.description);
      formData.append("project_url", editable.project_url);
      formData.append("tags", editable.tagsInput);

      if (editable.imageFile) {
        formData.append("image", editable.imageFile);
      }

      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string; project?: Project };

      if (!response.ok || !payload.project) {
        throw new Error(payload.error ?? "تعذر تحديث المشروع.");
      }

      setProjects((previous) => previous.map((project) => (project.id === projectId ? payload.project! : project)));
      cancelEdit();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "تعذر تحديث المشروع.";
      setError(message);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)]/90 px-5 py-4 backdrop-blur-lg sm:px-8">
        <Link
          href="/"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-3)] transition-all hover:border-[var(--line-hover)] hover:text-[var(--text-1)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="h-4 w-px bg-[var(--line)]" />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-3)]">لوحة التحكم</p>
        <div className="mr-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]">
            <span className="font-black text-[var(--indigo-light)]">{projects.length}</span>
            مشروع
          </div>
          <button type="button" onClick={() => void handleLogout()} disabled={isLoggingOut} className="btn btn-ghost text-xs">
            {isLoggingOut ? "خروج..." : "تسجيل الخروج"}
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-[820px] space-y-6 px-4 py-8 sm:px-6">
        <div className="anim-up">
          <h1 className="text-2xl font-black tracking-tighter text-[var(--text-1)] sm:text-3xl">
            إدارة المشاريع<span className="text-[var(--indigo-light)]">.</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--text-3)]">أضف وعدّل واحذف المشاريع من مساحة خاصة محمية.</p>
        </div>

        <AddProjectForm onCreated={(project) => setProjects((previous) => [project, ...previous])} />

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError("")} className="text-xs opacity-50 transition-opacity hover:opacity-100">
              ✕
            </button>
          </div>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-3)]">المشاريع ({projects.length})</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="card flex items-center gap-4 p-5">
                  <div className="h-11 w-11 flex-shrink-0 rounded-xl skel" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/5 skel" />
                    <div className="h-3 w-3/5 skel" />
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <div className="h-7 w-16 rounded-xl skel" />
                    <div className="h-7 w-14 rounded-xl skel" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && !projects.length ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--indigo-dim)] text-xl select-none">📂</div>
              <p className="text-sm font-bold text-[var(--text-2)]">لا توجد مشاريع</p>
              <p className="mt-1 text-xs text-[var(--text-3)]">ابدأ بإضافة أول مشروع</p>
            </div>
          ) : null}

          {projects.map((project) => {
            const isEditing = editingId === project.id && editable;

            return (
              <article key={project.id} className="card overflow-hidden anim-up">
                {isEditing ? (
                  <form onSubmit={(event) => void handleSaveEdit(event, project.id)} className="space-y-4 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-0.5 w-5 rounded-full bg-[var(--indigo)]" />
                      <span className="text-xs font-bold text-[var(--indigo-light)]">تعديل: {project.title}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">الاسم</span>
                        <input required value={editable.title} onChange={(event) => setEditable({ ...editable, title: event.target.value })} className="field" />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">الرابط</span>
                        <input required type="url" value={editable.project_url} onChange={(event) => setEditable({ ...editable, project_url: event.target.value })} className="field" dir="ltr" />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">الوصف</span>
                      <textarea required rows={2} value={editable.description} onChange={(event) => setEditable({ ...editable, description: event.target.value })} className="field resize-none" />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">الوسوم</span>
                        <input value={editable.tagsInput} onChange={(event) => setEditable({ ...editable, tagsInput: event.target.value })} className="field" dir="ltr" />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)]">صورة جديدة (اختياري)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setEditable({ ...editable, imageFile: event.target.files?.[0] ?? null })}
                          className="field cursor-pointer text-xs file:ml-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--indigo-dim)] file:px-2.5 file:py-1 file:text-[10px] file:font-black file:text-[var(--indigo-light)]"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button type="submit" className="btn btn-indigo text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                        حفظ
                      </button>
                      <button type="button" onClick={cancelEdit} className="btn btn-ghost text-xs">
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-[var(--text-1)]">{project.title}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-2)]">{project.description}</p>
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block max-w-xs truncate text-[10px] text-[var(--indigo-light)] hover:underline"
                        dir="ltr"
                      >
                        {project.project_url}
                      </a>
                      {project.tags?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.tags.map((tag) => (
                            <span key={`admin-${project.id}-${tag}`} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-0.5 flex flex-shrink-0 gap-2">
                      <button type="button" onClick={() => startEdit(project)} className="btn btn-ghost px-3 py-2 text-xs">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        تعديل
                      </button>
                      <button type="button" onClick={() => void handleDelete(project.id)} className="btn btn-danger px-3 py-2 text-xs">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
