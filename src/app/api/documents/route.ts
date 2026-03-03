import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Upload document to Supabase Storage + insert record
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const dealId = formData.get("deal_id") as string;
  const docType = formData.get("doc_type") as string;
  const name = formData.get("name") as string;
  const isClientVisible = formData.get("is_client_visible") === "true";

  if (!file || !dealId || !docType) {
    return NextResponse.json(
      { error: "File, deal_id e doc_type sono obbligatori" },
      { status: 400 }
    );
  }

  // Check version: count existing docs with same name and deal
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId)
    .eq("name", name || file.name);

  const version = (count || 0) + 1;

  // Upload to storage
  const storagePath = `${dealId}/${docType}/${Date.now()}_${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Errore upload: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Insert document record
  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      deal_id: dealId,
      name: name || file.name,
      doc_type: docType,
      storage_path: storagePath,
      version,
      is_client_visible: isClientVisible,
      uploaded_by: user.id,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `Errore salvataggio: ${insertError.message}` },
      { status: 500 }
    );
  }

  // Log activity
  await supabase.from("activities").insert({
    deal_id: dealId,
    user_id: user.id,
    activity_type: "document_upload",
    title: `Documento caricato: ${name || file.name}`,
    metadata: { doc_id: doc.id, doc_type: docType, version },
  });

  return NextResponse.json({ data: doc }, { status: 201 });
}

// GET: List documents with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("deal_id");
  const docType = searchParams.get("doc_type");

  let query = supabase
    .from("documents")
    .select("*, deal:deals(id, code, title), uploader:users!uploaded_by(id, full_name)")
    .order("created_at", { ascending: false });

  if (dealId) query = query.eq("deal_id", dealId);
  if (docType) query = query.eq("doc_type", docType);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// PATCH: Update document metadata
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID documento richiesto" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
