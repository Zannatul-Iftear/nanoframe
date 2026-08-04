# Nanoframe landing page

A static, dependency-free recreation of the After Effects intro: `index.html` + `css/styles.css` + `js/script.js`. No build step — open `index.html` in a browser, or host the folder as-is.

## What's here vs. what you need to drop in

**Built for you, no assets required:**
- The circular pinwheel/aperture mark is a hand-traced **inline SVG** (`<svg class="circle-mark">` in `index.html`), reconstructed from your video frame-by-frame. It's crisp at any size and needs no PNG.
- The 6 footer icons (email, Fiverr, Instagram, TikTok, YouTube, Facebook) are inline SVGs too.
- Body copy uses **Google Sans Flex**, loaded straight from Google Fonts (it's a real, free, official Google font — no file needed).

**You need to add one thing — the logo wordmark font:**
- `"Designer Regular"` is a licensed display font, not something on a public font CDN, so I can't legally hot-link it for you. Drop your licensed files into `/fonts` as:
  - `fonts/Designer-Regular.woff2` (and/or `.otf`)
- The `@font-face` rule in `css/styles.css` already points at those paths — it'll pick the font up automatically the moment the files exist. Until then, "NANOFRAME" renders in a bold, italic-skewed system fallback that's a reasonable stand-in.
- If you only have a `.ttf`/`.otf`, either add it directly (the `@font-face` already lists an `.otf` fallback) or convert to `.woff2` (e.g. via [Transfonter](https://transfonter.org/) or `fonttools`) for faster loading.

## Update your real links

In `index.html`, swap these placeholder URLs for your actual profiles:
```
mailto:hello@nanoframe.studio     → your email
https://www.fiverr.com/           → your Fiverr gig/profile
https://www.instagram.com/        → your Instagram
https://www.tiktok.com/           → your TikTok
https://www.youtube.com/          → your YouTube channel
https://www.facebook.com/         → your Facebook page
```

## How the background works (no video file)

The "infinite wave" is 4 large, softly-blurred radial-gradient blobs (one per grey: `#1D1D1D #282828 #303030 #404040`) drifting slowly on independent, staggered CSS animations — that's the "Motion Tile" feel, an endless, non-repeating-looking drift. On top, a hidden SVG filter (`feTurbulence` + `feDisplacementMap`, defined at the top of `index.html`) warps that blur, which is the direct CSS/SVG equivalent of After Effects' **Turbulent Displace**. It's all GPU-composited transforms + one filter, so it stays cheap — no video decode, no canvas loop, no per-frame JS.

If you ever do want to swap in an exported MP4 instead (e.g. for pixel-exact parity with the original render), replace the contents of `.bg-wave` with a `<video autoplay muted loop playsinline>` and drop `.bg-wave__inner`'s styles — the rest of the page doesn't care what's behind it.

## How the logo entry animation works

- The circle starts scaled to 0, spins up fast with a size overshoot, then settles — all in `circleSpinGrow` (`css/styles.css`).
- It then slides from the horizontal center of the whole lockup into its final left-hand slot (`circleMoveLeft`). That travel distance is measured live in `js/script.js` (half the text width + half the gap), so it's correct at any screen size or font.
- The wordmark reveals via a `clip-path` wipe (`textReveal`) timed to match — this is the coded equivalent of the mask reveal in your AE comp. A commented-out typewriter alternative (opacity-in per letter) is included at the bottom of the logo section in `styles.css` if you'd rather have that instead.
- The tagline and the icon row each do a simple opacity + 20px-up fade (`fadeUp`), staggered after the logo settles, with easing.
- Everything holds its final state indefinitely (`animation-fill-mode: both`); only the background keeps moving.
- `prefers-reduced-motion` is respected — animations are skipped entirely and elements just appear in their end state.

## Responsiveness

Everything is centered with a flex column on a `100svh` hero, so it stays centered through resizes, orientation changes, and any aspect ratio. Type and icon sizes use `clamp()` so they scale smoothly between mobile and desktop rather than jumping at fixed breakpoints.
