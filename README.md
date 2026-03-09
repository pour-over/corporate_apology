# CorporateApology.com

> "The most honest thing a company can do is automate its dishonesty."

AI-generated corporate non-apology letters. Enter a company name, pick a transgression, receive accountability.

---

## Deploy to Netlify (5 steps, ~3 minutes)

### 1. Get the files onto GitHub
- Create a new repo at github.com (name it `corporateapology` or anything)
- Upload this entire folder (drag & drop works in the GitHub UI)
- Commit

### 2. Connect to Netlify
- Go to app.netlify.com → **Add new site → Import an existing project**
- Connect your GitHub account and select the repo
- Build settings will be auto-detected from `netlify.toml` — no changes needed
- Click **Deploy site**

### 3. Add your API key (the important part)
- In Netlify: **Site Settings → Environment Variables → Add a variable**
- Key: `ANTHROPIC_API_KEY`
- Value: `sk-ant-...` (your Anthropic key from console.anthropic.com)
- Click Save, then **Trigger a redeploy** (Deploys tab → Trigger deploy)

### 4. Add your custom domain
- In Netlify: **Domain Management → Add custom domain**
- Type `corporateapology.com`
- Follow the DNS instructions (point your nameservers or add a CNAME)
- Netlify provisions SSL automatically

### 5. Done
Your site is live at corporateapology.com. The API key lives only in Netlify's
encrypted environment — never in the browser, never in the repo.

---

## Project Structure

```
corporateapology/
├── public/
│   └── index.html          ← the entire frontend (single file)
├── netlify/
│   └── functions/
│       └── apology.js      ← serverless proxy (keeps API key secret)
├── netlify.toml             ← build + routing config
└── README.md
```

## How the proxy works

```
Browser → POST /api/apology → Netlify Function → Anthropic API
                                    ↑
                            API key lives here only
                            (Netlify environment variable)
```

The browser never talks to Anthropic directly. It hits `/api/apology`,
which Netlify routes to the function, which injects the secret key and
forwards the request. Safe for public deployment.

---

Made by Ted Kocher · tedkocher.com · tedkocher@gmail.com
