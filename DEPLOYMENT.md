# Deploying to Vercel

The site is fully static. Every route prerenders at build time, every calculation runs in the browser, and there is no server, no database, and no API. That makes this about as simple as a deploy gets.

## Before you deploy

Run the checks locally. If any of these fail, fix them first, because Vercel will fail on the same thing and you will find out more slowly.

```
npm run build
npm run lint
npm test
```

All three should be clean, and the build should list nine static routes.

## First deploy

1. Push the repo to GitHub.
2. Go to vercel.com, choose **Add New Project**, and import the repository.
3. Change nothing on the configuration screen. Vercel detects Next.js and gets every setting right on its own: build command `next build`, output `.next`, install `npm install`. Do not override the build command.
4. Deploy.

You do not need to set any environment variable to get a working first deploy. The site will come up on a `*.vercel.app` address and behave correctly.

## Environment variables

There is exactly one, and it is optional until you have a real domain.

| Variable | Set it to | When |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://your-real-domain.com` | Once you attach a custom domain |

**What it does.** Open Graph image URLs have to be absolute, so the app needs to know where it lives. `src/app/layout.tsx` works this out in three steps: it uses `NEXT_PUBLIC_SITE_URL` if you set it, falls back to the Vercel production URL that Vercel injects automatically, and falls back again to localhost for local development.

**Why you care.** If you attach a custom domain and do not set this, the preview cards on shared links will still point at the old `*.vercel.app` address. The links will work, but the preview images may not load, and a link an advisor sends a client will look broken.

**How to set it.** In the Vercel dashboard: Settings, then Environment Variables. Add `NEXT_PUBLIC_SITE_URL`, scope it to Production, and redeploy. The value must include the scheme, so `https://example.com` rather than `example.com`.

Note the `NEXT_PUBLIC_` prefix is required. It is what tells Next to make the value available at build time, which is when the OG cards are generated.

## The one thing that must happen before the public sees this

**`compliance.reviewed` in `src/config/brand.ts` is set to `false`, and every legal string on the site is a placeholder written by a developer.**

While that flag is false, a black banner runs across the top of every page saying so. You can deploy in this state, and you should, because it is the fastest way to get the site in front of the people who need to review it. But do not send the link to a client, and do not point a public domain at it, until:

1. Someone qualified has read the four strings in the `compliance` object.
2. You have written the `licensing` string, which is currently empty on purpose. It names no regulator and no licence number, because guessing at those would be worse than leaving them blank.
3. You have set `reviewed: true` and redeployed.

`CONTENT_LOCATIONS.md` covers this in more detail.

## Custom domain

Vercel dashboard, Settings, Domains, add the domain, then follow the DNS instructions it gives you. Once it resolves, come back and set `NEXT_PUBLIC_SITE_URL` as described above, then redeploy so the OG cards pick it up.

## After it is live, check these

- All four routes load: `/`, `/tfsa-universal-life`, `/segregated-funds`, `/family-legacy`.
- Sliders drag, and the curve moves with them.
- Drag a slider, copy the URL, open it in a new tab. You should see the same numbers. This is the feature the whole site is built around, so it is worth testing on the real deployment rather than trusting that it worked locally.
- Paste a link into a message and confirm the preview card renders.
- Open it on a phone. The layout stacks, and nothing scrolls sideways.

## What does not need doing

No database to provision. No secrets to rotate. No API keys. Nothing a user types ever leaves their browser, so there is no data to protect on the server, because there is no server.
