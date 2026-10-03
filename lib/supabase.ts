import { createClient } from "@supabase/supabase-js";

function hasElevatedKey(key: string) {
  if (key.startsWith("sb_secret_")) return true;

  const payload = key.split(".")[1];
  if (!payload) return false;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).role === "service_role";
  } catch {
    return false;
  }
}

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Variáveis do Supabase não configuradas.");
  }
  if (!hasElevatedKey(key)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY precisa ser uma chave service_role ou sb_secret_; chaves anon/publishable não ignoram RLS.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}