// @ts-nocheck
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });

    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const { scopes = 'transaction', language = 'vi', redirectUri } = await req.json();

    const base = Deno.env.get('CAS_BASE_URL');
    const clientId = Deno.env.get('CAS_CLIENT_ID');
    const secretKey = Deno.env.get('CAS_SECRET_KEY');
    if (!base || !clientId || !secretKey) {
      return new Response(
        JSON.stringify({
          error: 'Server not configured',
          details: {
            env: {
              CAS_BASE_URL: !!base,
              CAS_CLIENT_ID: !!clientId,
              CAS_SECRET_KEY: !!secretKey,
            },
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const res = await fetch(`${base}/grant/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BankHub-Api-Version': '2023-01-01',
        'x-client-id': clientId,
        'x-secret-key': secretKey,
      },
      body: JSON.stringify({ scopes, language, redirectUri }),
    });

    const raw = await res.text();
    let data: any = null;
    try { data = raw ? JSON.parse(raw) : null; } catch {}
    if (!res.ok) return new Response(JSON.stringify({ error: data?.error || res.statusText || 'CAS upstream error', details: data ?? raw }), { status: res.status, headers: { 'Content-Type': 'application/json' } });

    return new Response(JSON.stringify({ grantToken: data.grantToken, casLinkUrl: data.casLinkUrl || `${base}/link?grant=${data.grantToken}` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});



