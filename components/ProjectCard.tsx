"use client";

import Image from "next/image";

export type Project = {
  id: string;
  title: string;
  description: string;
  project_url: string;
  image_url: string;
  tags: string[];
  created_at: string;
};

type ProjectCardProps = {
  project: Project;
  index?: number;
};

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const delay = Math.min(index * 60, 360);

  return (
    <article className="card card-lift group overflow-hidden anim-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center select-none">
            <span className="text-7xl font-black opacity-[0.05] text-[var(--indigo-light)]">
              {project.title.at(0)?.toUpperCase()}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030712]/70 via-transparent to-transparent" />

        <div className="absolute right-3 top-3">
          <span className="rounded-md border border-[var(--line)] bg-[var(--bg)]/70 px-2 py-0.5 text-[10px] font-black tabular-nums text-[var(--text-3)] backdrop-blur-md">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-1 text-[0.95rem] font-bold leading-snug text-[var(--text-1)]">{project.title}</h2>
        <p className="mt-1.5 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--text-2)]">{project.description}</p>

        {project.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((tag) => (
              <span key={`${project.id}-${tag}`} className="tag">
                {tag}
              </span>
            ))}
            {project.tags.length > 4 ? <span className="tag opacity-50">+{project.tags.length - 4}</span> : null}
          </div>
        ) : null}

        <div className="rule mb-4 mt-4" />

        <div className="flex items-center justify-between gap-3">
          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn btn-indigo flex-shrink-0 text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            فتح المشروع
          </a>
          <time className="flex-shrink-0 text-[0.67rem] font-semibold tabular-nums text-[var(--text-3)]">
            {new Date(project.created_at).toLocaleDateString("ar-SA", {
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>
      </div>
    </article>
  );
}
