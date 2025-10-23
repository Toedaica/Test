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

    const { sinceDays = 90, household_id = null } = await req.json();

    const base = Deno.env.get('CAS_BASE_URL');
    const clientId = Deno.env.get('CAS_CLIENT_ID');
    const secretKey = Deno.env.get('CAS_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!base || !clientId || !secretKey || !supabaseUrl || !serviceKey || !anonKey) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth! } } });
    const { data: userRes } = await userClient.auth.getUser();
    const uid = userRes?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: 'Unauthorized user' }), { status: 401 });

    const service = createClient(supabaseUrl, serviceKey);
    const { data: integ, error: integErr } = await service.from('household_integrations')
      .select('access_token')
      .eq('integration', 'cas')
      .eq('owner_user_id', uid)
      .eq('household_id', household_id)
      .maybeSingle();
    if (integErr) return new Response(JSON.stringify({ error: integErr.message }), { status: 500 });
    const accessToken = integ?.access_token;
    if (!accessToken) return new Response(JSON.stringify({ error: 'No CAS access token' }), { status: 400 });

    const url = new URL(`${base}/transactions`);
    url.searchParams.set('sinceDays', String(sinceDays));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-BankHub-Api-Version': '2023-01-01',
        'x-client-id': clientId,
        'x-secret-key': secretKey,
        'Authorization': accessToken,
      },
    });

    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: data?.error || res.statusText }), { status: res.status });

    const txs = (data?.transactions || []) as any[];

    let upserted = 0;
    for (const t of txs) {
      const bt = {
        external_source: 'cas',
        external_id: t.id,
        gateway: 'cas',
        transaction_date: t.date,
        transfer_type: t.type === 'in' ? 'in' : 'out',
        transfer_amount: t.amount,
        content: t.description ?? null,
        reference_code: t.reference ?? null,
        bank_account_id: t.accountId ?? null,
      };
      const up = await service.from('bank_transactions').upsert(bt, { onConflict: 'external_source,external_id' }).select('id');
      if (up.error) return new Response(JSON.stringify({ error: up.error.message }), { status: 500 });
      upserted += up.data?.length || 0;
    }

    return new Response(JSON.stringify({ imported: txs.length, upsertedBankTx: upserted }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
});



