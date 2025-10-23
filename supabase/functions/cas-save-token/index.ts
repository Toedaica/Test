// @ts-nocheck
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });

    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { accessToken, expiresAt = null, household_id = null } = await req.json();
    if (!accessToken) return new Response(JSON.stringify({ error: 'accessToken is required' }), { status: 400 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !serviceKey || !anonKey) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth! } } });
    const { data: userRes } = await userClient.auth.getUser();
    const uid = userRes?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: 'Unauthorized user' }), { status: 401 });

    const service = createClient(supabaseUrl, serviceKey);
    const { data: upData, error: upErr } = await service.from('household_integrations').upsert({
      household_id,
      owner_user_id: uid,
      integration: 'cas',
      access_token: accessToken,
      refresh_token: null,
      expires_at: expiresAt,
      metadata: { provider: 'cas' },
    }, { onConflict: 'household_id,integration,owner_user_id' }).select('id').maybeSingle();
    if (upErr) return new Response(JSON.stringify({ error: upErr.message }), { status: 500 });

    return new Response(JSON.stringify({ success: true, integration_id: upData?.id ?? null, household_id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
});


