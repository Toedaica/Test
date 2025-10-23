// @ts-nocheck
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== 'GET') {
      return new Response('<h1>405 Method Not Allowed</h1>', { status: 405, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const url = new URL(req.url);
    const publicToken = url.searchParams.get('publicToken') || '';
    const state = url.searchParams.get('state') || '';
    const target = url.searchParams.get('target') || 'myapp://cas-callback';

    const sep = target.includes('?') ? '&' : '?';
    const redirectTo = `${target}${sep}publicToken=${encodeURIComponent(publicToken)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Redirecting…</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;line-height:1.5}</style></head>
<body>
  <h3>Đang chuyển hướng về ứng dụng…</h3>
  <p>Nếu không tự động, bấm liên kết bên dưới.</p>
  <p><a id="link" href="${redirectTo}">${redirectTo}</a></p>
  <script>setTimeout(function(){ try{ window.location.replace(document.getElementById('link').href); }catch(e){ window.location.href=document.getElementById('link').href; } }, 50);</script>
</body></html>`;

    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (e: any) {
    const html = `<!doctype html><html><body><pre>${(e?.message || 'Unknown error')}</pre></body></html>`;
    return new Response(html, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
});






