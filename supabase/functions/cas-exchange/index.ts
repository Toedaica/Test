// @ts-nocheck
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });

    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const { publicToken, household_id = null } = await req.json();
    if (!publicToken) return new Response(JSON.stringify({ error: 'publicToken is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const base = Deno.env.get('CAS_BASE_URL');
    const clientId = Deno.env.get('CAS_CLIENT_ID');
    const secretKey = Deno.env.get('CAS_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!base || !clientId || !secretKey || !supabaseUrl || !serviceKey || !anonKey) {
      return new Response(
        JSON.stringify({
          error: 'Server not configured',
          details: {
            env: {
              CAS_BASE_URL: !!base,
              CAS_CLIENT_ID: !!clientId,
              CAS_SECRET_KEY: !!secretKey,
              SUPABASE_URL: !!supabaseUrl,
              SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
              SUPABASE_ANON_KEY: !!anonKey,
            },
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const res = await fetch(`${base}/grant/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BankHub-Api-Version': '2023-01-01',
        'x-client-id': clientId,
        'x-secret-key': secretKey,
      },
      body: JSON.stringify({ publicToken }),
    });

    const raw = await res.text();
    let data: any = null;
    try { data = raw ? JSON.parse(raw) : null; } catch {}
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error || res.statusText || 'CAS upstream error', details: data ?? raw }), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth! } } });
    const { data: userRes } = await userClient.auth.getUser();
    const uid = userRes?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: 'Unauthorized user' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const service = createClient(supabaseUrl, serviceKey);
    const up = await service.from('household_integrations').upsert({
      household_id,
      owner_user_id: uid,
      integration: 'cas',
      access_token: data.accessToken,
      refresh_token: data.refreshToken ?? null,
      expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      metadata: { provider: 'cas' },
    }, { onConflict: 'household_id,integration,owner_user_id' }).select('id').single();
    if (up.error) return new Response(JSON.stringify({ error: 'Failed to save integration', details: up.error }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    return new Response(
      JSON.stringify({ accessToken: data.accessToken, expiresAt: data.expiresAt, integration_id: up.data?.id, household_id }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});



