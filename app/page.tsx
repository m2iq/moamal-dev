"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ProjectCard, { type Project } from "@/components/ProjectCard";
import { supabase, supabaseEnvError } from "@/lib/supabaseClient";

const socialLinks = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@irq.dv",
    label: "تابعني على تيك توك",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.12v12.07a2.84 2.84 0 0 1-5.67-.2 2.84 2.84 0 0 1 2.84-2.84c.34 0 .67.06.98.17V8.02a6 6 0 0 0-1-.05A6 6 0 1 0 15.82 14V8.11a7.9 7.9 0 0 0 4.64 1.49V6.69h-.87Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mo_nz.0",
    label: "تابعني على إنستغرام",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.9">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
        <circle cx="12" cy="12" r="4.15" />
        <circle cx="17.3" cy="6.7" r="1.05" className="fill-current stroke-none" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://web.telegram.org/k/#@irq_dv",
    label: "تابعني على تيليجرام",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
        <path d="M21.44 4.74a1.5 1.5 0 0 0-1.57-.2L3.2 11.18a1.5 1.5 0 0 0 .12 2.82l4.17 1.4 1.55 4.98a1.5 1.5 0 0 0 2.58.56l2.34-2.85 4.58 3.35a1.5 1.5 0 0 0 2.35-.88l2.03-14.3a1.5 1.5 0 0 0-.48-1.52ZM9.08 14.6l8.56-6.55-6.65 7.63-.34 3.06-1.57-4.14Z" />
      </svg>
    ),
  },
] as const;

function SocialStrip() {
  return (
    <div className="social-strip-wrap card mt-3 overflow-hidden rounded-2xl p-[1px]">
      <div className="social-strip-inner relative flex items-center justify-between gap-3 rounded-[15px] px-3 py-2.5">
        <div className="pointer-events-none absolute inset-0 rounded-[15px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent social-strip-sheen" />
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--indigo-light)]">Social</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-2)]">تابعني على المنصات</p>
        </div>
        <div className="social-strip-icons relative z-[1] flex items-center gap-2">
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              title={item.label}
              className="social-icon-btn"
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function getAllTags(projects: Project[]): string[] {
  const set = new Set<string>();
  projects.forEach((project) => project.tags?.forEach((tag) => set.add(tag)));
  return Array.from(set);
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[16/10] skel" style={{ borderRadius: "16px 16px 0 0" }} />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/5 skel" />
        <div className="h-3 w-full skel" />
        <div className="h-3 w-4/5 skel" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-14 skel" />
          <div className="h-5 w-10 skel" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!supabase) {
        setError(supabaseEnvError);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      setProjects((data ?? []) as Project[]);
      setIsLoading(false);
    };

    void fetchProjects();
  }, []);

  const allTags = useMemo(() => getAllTags(projects), [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (activeTag) {
      result = result.filter((project) => project.tags?.includes(activeTag));
    }

    const normalizedQuery = search.trim().toLowerCase();

    if (normalizedQuery) {
      result = result.filter((project) => {
        const fullText = `${project.title} ${project.description} ${(project.tags ?? []).join(" ")}`.toLowerCase();
        return fullText.includes(normalizedQuery);
      });
    }

    return result;
  }, [activeTag, projects, search]);

  const toggleTag = (tag: string) => {
    setActiveTag((previous) => (previous === tag ? null : tag));
  };

  const resetFilters = () => {
    setSearch("");
    setActiveTag(null);
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/90 px-5 py-3.5 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="dot-live" />
          <span className="text-sm font-black tracking-tight text-[var(--text-1)]">مؤمل </span>
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-3)]">
          معرض الأعمال
        </span>
      </nav>

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="space-y-5 pb-6 pt-7 anim-up lg:hidden">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <Image src="/assets/images/tik_avatar.jpeg" alt="مؤمل" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-none tracking-tighter text-[var(--text-1)]">
                مؤمل - dev<span className="text-[var(--indigo-light)]">.</span>
              </h1>
              <p className="mt-1 text-xs font-semibold text-[var(--text-3)]">Full-stack Developer</p>
            </div>
          </div>

          <SocialStrip />

          <div className="relative">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث في المشاريع..."
              className="field pr-10"
              style={{
                paddingRight:32
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-3)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
          </div>

          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setActiveTag(null)} className={`tag tag-btn ${!activeTag ? "tag-on" : ""}`}>
                الكل
              </button>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`tag tag-btn ${activeTag === tag ? "tag-on" : ""}`}>
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-10 pb-16 lg:flex-row lg:pt-12">
          <main className="min-w-0 flex-1">
            <div className="mb-8 hidden items-baseline gap-4 anim-up lg:flex">
              <h1 className="text-4xl font-black leading-none tracking-tighter text-[var(--text-1)]">
                المشاريع<span className="text-[var(--indigo-light)]">.</span>
              </h1>
              {!isLoading ? (
                <span className="text-sm font-semibold text-[var(--text-3)]">
                  {filteredProjects.length} {filteredProjects.length !== projects.length ? `من ${projects.length}` : ""}
                </span>
              ) : null}
            </div>

            {error ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <SkeletonCard key={item} />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-16 w-16 select-none items-center justify-center rounded-2xl bg-[var(--indigo-dim)] text-2xl">
                  ◌
                </div>
                <p className="font-bold text-[var(--text-2)]">لا توجد نتائج</p>
                <p className="mt-1 text-sm text-[var(--text-3)]">جرّب تغيير الكلمات أو الوسوم</p>
                {search || activeTag ? (
                  <button onClick={resetFilters} className="btn btn-ghost mt-5 text-xs">
                    إعادة الضبط
                  </button>
                ) : null}
              </div>
            )}
          </main>

          <aside className="sticky top-12 hidden w-[260px] flex-shrink-0 flex-col gap-4 self-start xl:w-[280px] lg:flex">
            <div className="panel p-5 anim-up d-50">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                  <Image src="/assets/images/tik_avatar.jpeg" alt="مؤمل - dev" fill className="object-cover" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface-2)] bg-[var(--green)]" />
                </div>
                <div>
                  <p className="text-sm font-black leading-tight tracking-tight text-[var(--text-1)]">مؤمل - dev</p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-3)]">Full-stack Developer</p>
                </div>
              </div>

              <SocialStrip />

              <p className="mt-4 text-xs leading-relaxed text-[var(--text-2)]">
                أبني تجارب رقمية سريعة وجميلة من الفكرة حتى الإطلاق.
              </p>

              <div className="rule my-4" />

              <div className="flex gap-2.5">
                <div className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--indigo-dim)] p-3 text-center">
                  <p className="text-xl font-black leading-none text-[var(--indigo-light)]">{projects.length}</p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">مشروع</p>
                </div>
                <div className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--indigo-dim)] p-3 text-center">
                  <p className="text-xl font-black leading-none text-[var(--indigo-light)]">{allTags.length}</p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">تقنية</p>
                </div>
              </div>
            </div>

            <div className="anim-up d-100">
              <div className="relative">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="بحث في المشاريع..."
                  className="field pr-10 text-sm"
                   style={{
                paddingRight:32
              }}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-3)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
              </div>
            </div>

            {allTags.length > 0 ? (
              <div className="panel p-4 anim-up d-150">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-3)]">تصفية بالتقنية</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setActiveTag(null)} className={`tag tag-btn ${!activeTag ? "tag-on" : ""}`}>
                    الكل
                  </button>
                  {allTags.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`tag tag-btn ${activeTag === tag ? "tag-on" : ""}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
