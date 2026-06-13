import { NextRequest, NextResponse } from "next/server";
import { isAdmin, supabaseAdmin } from "@/lib/admin";

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { user_id, email, plan, blocked } = await req.json();

  if (email !== undefined) {
    await supabaseAdmin.from("profiles").update({ email }).eq("id", user_id);
  }

  if (blocked !== undefined) {
    await supabaseAdmin.from("profiles").update({ blocked }).eq("id", user_id);
  }

  if (plan !== undefined) {
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (sub) {
      await supabaseAdmin.from("subscriptions").update({ plan }).eq("user_id", user_id);
    } else {
      await supabaseAdmin.from("subscriptions").insert({ user_id, plan, status: "active" });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { user_id } = await req.json();
  await supabaseAdmin.auth.admin.deleteUser(user_id);

  return NextResponse.json({ ok: true });
}
