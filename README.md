# DeryCare — Clean Living, Made Simple

The official DeryCare website: a product marketplace + cleaning-service booking platform + brand site for a technology-enabled hygiene ecosystem. Powered by DeryCode technology.

**Live site:** https://asiimwe3.github.io/derycare/

## Pages
- `/` — Homepage (hero, ecosystem, shop by need, featured products, services, how it works, refill, business, technology, impact, reviews, before & after, clean living, final CTA)
- `/shop` — Shop by need with live filtering
- `/cart` — Cart with WhatsApp checkout
- `/services` + `/book` — Cleaning services and booking form
- `/business` — B2B solutions and quote form
- `/refill` — Refill programme and locations
- `/about`, `/impact` (with careers/join form), `/clean-living` (guides), `/contact` (FAQs)

## How it works
- Pure HTML/CSS/JS — no build step, no dependencies, fast on any phone.
- Mobile-first with a persistent bottom action bar: Shop | Book | WhatsApp.
- Products and cart live in `assets/app.js` (`PRODUCTS` array) + localStorage. Checkout, bookings, B2B quotes and applications compose a WhatsApp message to +256 762 306 675 — orders arrive instantly, no backend required.
- To change the WhatsApp number: edit `WA` in `assets/app.js`.
- To add products: add entries to `PRODUCTS` (set `need` tags so they appear in the right categories).
- Designed to grow internationally later: multi-currency/multi-country can be layered into the `PRODUCTS` data and pricing without redesign.

## Structure
```
index.html, shop.html, cart.html, services.html, book.html,
business.html, refill.html, about.html, impact.html,
clean-living.html, contact.html
assets/style.css   — design system
assets/app.js      — products, cart, checkout, bookings, shared chrome
assets/img/        — brand photography
```

© 2026 DeryCare. Powered by DeryCode technology.
