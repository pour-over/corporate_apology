// netlify/functions/apology.mjs
// Server-side proxy — API key never hits the browser.

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return new Response(
    JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY not set in Netlify → Site Settings → Environment Variables' } }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: { message: 'Invalid JSON' } }), { status: 400 }); }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: body.max_tokens || 2400,
      system: body.system,
      messages: body.messages
    })
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
};

export const config = { path: '/api/apology' };
