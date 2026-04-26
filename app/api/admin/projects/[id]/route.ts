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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  if (!title || !description || !projectUrl) {
    return NextResponse.json({ error: "بيانات التحديث غير مكتملة." }, { status: 400 });
  }

  try {
    const updatePayload: Partial<Project> = {
      title,
      description,
      project_url: projectUrl,
      tags,
    };

    if (image instanceof File && image.size > 0) {
      updatePayload.image_url = await uploadProjectImage(image);
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(updatePayload)
      .eq("id", params.id)
      .select()
      .single<Project>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر تحديث المشروع." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!hasAdminSession(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    return unauthorized();
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: supabaseAdminEnvError }, { status: 500 });
  }

  const { error } = await supabaseAdmin.from("projects").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}