# Deploying the site

## One-time: turn on the booking form

The form is built and validated, but it needs a free key before it can send mail.

1. Go to **https://web3forms.com**
2. Type **omdagur1@gmail.com** into the "Create Access Key" box
3. That inbox gets an email with an access key - copy it
4. Open `src/components/BookShow.js` and replace `PASTE_YOUR_ACCESS_KEY_HERE`
   with the key (line ~26)

Until you do this, the form still works - it falls back to opening the
visitor's own mail app with every field pre-filled, addressed to
omdagur1@gmail.com. It is never a dead end, it just isn't automatic.

The key is safe to commit to a public repo: Web3Forms keys are designed to be
public and can only ever deliver mail to the address they were created for.

---

## The repo

Already connected: **https://github.com/Nishant2306/OmDagur** (public, `main` branch).

Pages serves from the `gh-pages` branch, which `npm run deploy` writes for you.
If Pages ever needs re-enabling: repo → Settings → Pages → Source = `gh-pages`
branch, folder `/`.

---

## Every time you want to publish

```bash
npm run deploy
```

That builds the site and pushes `build/` to the `gh-pages` branch. Live at:

**https://nishant2306.github.io/OmDagur**

First deploy takes 2–3 minutes to appear. After that it's usually under a minute.

Note: `npm run deploy` publishes whatever is in your working folder - it does
not require you to commit first. To also save your source history:

```bash
git add -A
git commit -m "your message"
git push
```

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

2. Create a file `public/CNAME` containing just your domain:

   ```
   omdagur.com
   ```

   (It must live in `public/` so it survives every build.)

3. `npm run deploy`, then in the repo: Settings → Pages → Custom domain →
   enter the domain → tick **Enforce HTTPS** once the certificate is issued
   (can take up to an hour).

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
