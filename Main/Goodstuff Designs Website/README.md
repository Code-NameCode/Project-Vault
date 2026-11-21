# Goodstuff Designs static redesign

This is the static HTML/CSS/JS build for the Goodstuff Designs redesign.

Open `index.html` in a browser to review the local version. The folder is intentionally plain and framework-free.

## Pages

- Homepage
- Services (service overview)
- IT & Networks (network administration, IT support, cybersecurity, monitoring, AI for IT operations, infrastructure, managed services)
- Digital Marketing (measurement, social media, Google Ads, reporting and ROI)
- Websites & Hosting (merged web development + hosting page)
- AI (AI experts: workflows, integrations, AI-assisted support and marketing)
- Design Styles (live-iframe gallery of all `examples/` pages)
- Portfolio
- Studio (Goodstuff-Studio product page)
- Contact (form posts to the report.goodstuffdesigns.co.za backend)
- Privacy, Cookie policy, 404

Legacy routes `/web-development` and `/hosting` permanently redirect to `/websites-and-hosting` (see `vercel.json` and `.htaccess`).

## Included

- `llms.txt`, `sitemap.md`, `sitemap.xml`, `robots.txt` (open to PageSpeed Insights / Lighthouse crawlers)
- Public `service-catalog.json`
- Markdown mirrors for every content page (`.md` served as `text/markdown` via Vercel headers)
- Vercel rewrite/header/redirect config, plus an `.htaccess` twin for Apache/DirectAdmin hosting

`design-styles.html` renders every file in `examples/` as a scaled-down live iframe, ten at a time. Previews only fetch when scrolled near the viewport, so "View all" does not pull every example at once. It reads its metadata from the cards in the markup plus the inline `STYLE_DETAILS` object; to rebuild it, regenerate the card list rather than hand-editing.

## Next work

- Add verified business facts, support hours, service area, and claims.
- Add approved case studies and real proof.
- Retire the unused Generation-1 CSS block in `assets/css/styles.css`.
