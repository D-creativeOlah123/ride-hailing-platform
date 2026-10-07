# Landing page

`src/pages/LandingPage.jsx` only stacks the sections in this folder. Copy, photos, numbers and links all live in **`landingContent.js`**.

## Editing copy

Open `landingContent.js` and change the text in place. Each section has its own export (`heroSlides`, `forRiders`, `howItWorks`, `rideOptions`, `safety`, `forDrivers`, `cities`, `stats`, `testimonials`, `faq`, …). Fares are numbers in naira; `naira()` formats them.

- **Driver earnings estimate:** `forDrivers.earningsPerHour` (₦ per online hour) and `forDrivers.hours`.
- **Hero framing:** each slide's `focal: { mobile, desktop }` is a CSS `object-position` (also the zoom origin). Phones are portrait, so the x value matters most there; on desktop the y value does.

## Swapping a photo

1. In `client/scripts/landing-images.json`, change the entry's `src` (an `https://images.unsplash.com/photo-…` URL), `id`, `by` and `page`. Use free-licence photos only (Unsplash or Pexels licence), with no visible brand logos.
2. Delete the old outputs: `public/landing/<file>.webp`, `public/landing/<file>-sm.webp` and `.image-cache/<file>.jpg`.
3. Run `npm run images`. It downloads the original, writes a large and a small WebP to `public/landing/`, and regenerates `images.generated.js` (dimensions + credits).
4. Update the photo's `alt` text in `landingContent.js` if the subject changed.

Sizes per `kind`: `hero` 1920/960 px, `card` 1280/640 px, `portrait` 480/240 px square (face-aware crop).

To add a new photo, add an entry to `landing-images.json`, run `npm run images`, then reference it with `photo('<file>', '<alt text>')` in `landingContent.js`.

## Building blocks

| File | Purpose |
|---|---|
| `Photo.jsx` | Responsive `<img>` (srcset, width/height, lazy) with a branded fallback if a file is missing |
| `useCarousel.js` | Index, autoplay, pause rules, swipe, arrow keys; `useReducedMotion()` |
| `useInView.js` / `Reveal.jsx` | Fade-up on scroll (skipped with reduced motion) |
| `SectionHeading.jsx` | Eyebrow + title + body |
| `CarTop.jsx` | Inline top-down car used in the live map (`src/assets/landing/car-top.svg` is the standalone file) |

All animations respect `prefers-reduced-motion`. Keyframes are in `tailwind.config.js`.
