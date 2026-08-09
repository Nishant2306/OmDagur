# Deploying the site

## One-time: turn on the booking form

The form is built and validated, but it needs a free key before it can send mail.

**Get the key:** go to **https://web3forms.com**, type **omdagur1@gmail.com**
into the "Create Access Key" box. That inbox gets the key within a minute.
No account required.

**Give it to the deployed site** - add it as a repository secret:

```bash
gh secret set WEB3FORMS_KEY
```

(it prompts for the value), or through the web UI:
repo → Settings → Secrets and variables → Actions → **New repository secret**,
named exactly `WEB3FORMS_KEY`.

The deploy workflow reads it automatically. If it's missing, the build still
succeeds but prints a warning in the Actions log.

**Give it to your own machine** - create `.env.local` in the project root:

```
REACT_APP_WEB3FORMS_KEY=your-key-here
```

`.env.local` is gitignored, so it never gets committed. Restart `npm start`
after creating it. Without this, the form works locally but falls back to
mailto.

Until a key is set anywhere, the form is still not a dead end: it opens the
visitor's own mail app with every field pre-filled, addressed to
omdagur1@gmail.com. It just isn't automatic.

### A note on what the secret does and doesn't do

Keeping the key in a secret keeps it out of the repo and out of git history,
which is what protects it from bots that scrape GitHub for credentials. That
is a real benefit and worth doing.

It does **not** hide the key from visitors. Create React App inlines every
`REACT_APP_*` value into the JavaScript bundle at build time, so it is
readable in the shipped site regardless of where it was stored. That is
acceptable for this particular key - a Web3Forms access key can only ever
deliver mail to the single address it was created for, so it can't be used to
redirect enquiries.

The corollary matters: **never** put a genuine secret (payment credentials, a
database password, a private API key) in a `REACT_APP_*` variable. It would be
published to every visitor.

If the key ever attracts spam, request a fresh one and replace the secret -
rotation is the mitigation here, not secrecy.

---

## The repo

Already connected: **https://github.com/Nishant2306/OmDagur** (public, `main` branch).

Pages serves from the `gh-pages` branch, which `npm run deploy` writes for you.
If Pages ever needs re-enabling: repo → Settings → Pages → Source = `gh-pages`
branch, folder `/`.

---

## Publishing: it's automatic

`.github/workflows/deploy.yml` builds and publishes the site on **every push to
`main`**. You just push:

```bash
git add -A
git commit -m "your message"
git push
```

GitHub then installs dependencies, builds, and pushes the result to the
`gh-pages` branch. Takes about 2 minutes. Watch it at:

**https://github.com/Nishant2306/OmDagur/actions**

Live at **https://nishant2306.github.io/OmDagur**

You can also re-deploy without pushing anything: Actions tab → "Deploy to
GitHub Pages" → **Run workflow**.

### One-time setup before the first push

GitHub refuses to accept a workflow file unless your token carries the
`workflow` scope, and yours currently doesn't. Run this once:

```bash
gh auth refresh -s workflow
```

Without it the push fails with *"refusing to allow an OAuth App to create or
update workflow ... without `workflow` scope"*. Nothing else is affected -
your other pushes work fine.

### If a deploy fails

Actions sets `CI=true`, and Create React App treats **lint warnings as errors**
when it's set. So an unused variable will fail the build instead of shipping.
That's deliberate - it stops a broken build going live. The Actions log names
the file and line.

If you'd rather warnings didn't block a deploy, change the build step in
`.github/workflows/deploy.yml` to:

```yaml
        run: CI=false npm run build
```

### The manual route still works

`npm run deploy` publishes straight from your working folder without
committing. Handy for a quick fix, but the automatic deploy on the next push
will overwrite it with whatever is on `main` - so don't rely on it for
anything you haven't committed.

---

## Later: putting it on a real domain

`package.json` sets `"homepage": "."`, which makes every asset path relative.
That means **the exact same build works on a custom domain with no changes.**

Once you buy a domain (e.g. `omdagur.com`):

1. At your domain registrar, add these DNS records:

   | Type  | Name  | Value                    |
   |-------|-------|--------------------------|
   | A     | @     | 185.199.108.153          |
   | A     | @     | 185.199.109.153          |
   | A     | @     | 185.199.110.153          |
   | A     | @     | 185.199.111.153          |
   | CNAME | www   | nishant2306.github.io.   |

   Some registrars write the apex as blank or as the domain itself rather
   than `@` - they all mean the same thing. Leave any pre-existing parking
   or redirect records off, or they'll fight these.

2. Create a file **`public/CNAME`** containing just your domain, no protocol
   and no trailing slash:

   ```
   omdagur.com
   ```

   **This step is not optional with automated deploys.** GitHub stores the
   custom domain as a `CNAME` file at the root of the `gh-pages` branch. Every
   deploy replaces that branch's contents, so if the file isn't produced by
   the build, the next push silently wipes your custom domain and the site
   falls back to the github.io address. Putting it in `public/` means CRA
   copies it into `build/` on every single build, so it always survives.

3. Push. The Action deploys, then in the repo: Settings → Pages → Custom
   domain → enter the domain → Save. Wait for the DNS check to pass, then
   tick **Enforce HTTPS** once the certificate is issued (usually minutes,
   occasionally up to an hour).

Nothing about the booking form changes on a custom domain - the key still
comes from the same secret, and Web3Forms delivers to the address the key was
created for regardless of which domain the form is served from.

Because `"homepage": "."` makes asset paths relative, the same build works on
both `nishant2306.github.io/OmDagur` and a root domain with no rebuild needed.

---

## Editing content

Almost everything lives in `src/theme.js`:

- `YOUTUBE_VIDEOS` / `YOUTUBE_SHORTS` - add or remove media here. The scroll
  showcase and the gallery both build themselves from this list, so adding a
  6th video automatically lengthens the showcase and adds a gallery card.
  Nothing else needs touching.
- `CHANNELS`, `SOCIALS` - the channel cards and social buttons.

The scrolling ribbon's wording is in `src/components/Marquee.js` - `BOOKABLE`
(the yellow row, which links to the booking form) and `FLAVOUR` (the outlined
row). Worth reviewing that these describe the kinds of gigs Om actually wants.

Form fields, event types and budget ranges are at the top of
`src/components/BookShow.js`.
