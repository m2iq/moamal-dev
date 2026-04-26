import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Project } from "@/components/ProjectCard";
import { ADMIN_COOKIE_NAME, hasAdminSession } from "@/lib/adminAuth";
import { supabaseAdmin, supabaseAdminEnvError } from "@/lib/supabaseAdmin";

const STORAGE_BUCKET = "project-images";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
}

async function uploadProjectImage(file: File) {
  if (!supabaseAdmin) {
    throw new Error(supabaseAdminEnvError);
  }

  const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(safeFileName, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(safeFileName);
  return data.publicUrl;
}

export async function GET() {
  if (!hasAdminSession(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    return unauthorized();
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: supabaseAdminEnvError }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin.from("projects").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: (data ?? []) as Project[] });
}

export async function POST(request: Request) {
  if (!hasAdminSession(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    return unauthorized();
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: supabaseAdminEnvError }, { status: 500 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const projectUrl = String(formData.get("project_url") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const image = formData.get("image");

  if (!title || !description || !projectUrl || !(image instanceof File)) {
    return NextResponse.json({ error: "بيانات المشروع غير مكتملة." }, { status: 400 });
  }

  try {
    const imageUrl = await uploadProjectImage(image);

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        title,
        description,
        project_url: projectUrl,
        image_url: imageUrl,
        tags,
      })
      .select()
      .single<Project>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر إنشاء المشروع." },
      { status: 500 },
    );
  }
}