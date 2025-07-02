// functions/create-notification/index.ts

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.json();
  const { user_id, title, message, job_id, type, notifiable_type, notifiable_id } = body;

  const { error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id,
        type,
        notifiable_type,
        notifiable_id,
        title,
        message,
        job_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seen: false,
      },
    ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
