// netlify/functions/apology.js
// Server-side proxy — keeps your Anthropic API key out of the browser

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: body.system,
      messages: body.messages
    })
  });

  const data = await upstream.json();

  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = {
  path: '/api/apology'
};
