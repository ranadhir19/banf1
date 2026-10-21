# Media Manifest — Wix page components (jaxbengali.org migration)

Every image in the 8 generated pages (`home.html`, `about.html`, `events.html`, `membership.html`,
`gallery.html`, `magazine.html`, `guide.html`, `contact.html`) that was already hosted on
`static.wixstatic.com` keeps its original Wix CDN URL — no token, no action needed.
Every other image was originally replaced by a token in the markup. **All tokens are now
resolved: the 8 page files are final and contain zero `__WIX…__` tokens (verified by grep).**
No token substitution and no media upload is needed at placement time for the HTML files.

## Token resolutions (final)

| Token (retired) | Resolution | Files affected |
|---|---|---|
| `__WIX_FLYER_URL__` | **Removed from the markup.** The Sharodotsav Durga Puja 2026 flyer (`sharodotsav-2026-flyer.jpg`, supplied by Ranadhir; repo copy: `banf1/docs/assets/sharodotsav-2026-flyer.jpg`) is already in Banf Production's Media Manager and is placed at placement time as a **native Wix image element** at the top of the Home 2026 and Events pages, **above** the HTML component — the component keeps the "Sharodotsav — Durga Puja 2026" heading and caption. | home.html, events.html (the `<a href>` wrapper + `<img>` deleted from both) |
| `__WIX_MEDIA_1__` | **Inlined as a data URI — no upload needed.** The home hero background photo (Unsplash `photo-1545893835-abaa50cbe628`, referenced by the source site's `.hero::before` CSS) was downloaded, recompressed (1280 px wide, JPEG quality 70, ~43.5 KB) and embedded in home.html's `.hero::before` background as `url("data:image/jpeg;base64,…")`. | home.html (1, inside the page `<style>`) |
| `__WIX_MEDIA_2__` | **Resolved substitution — existing Wix CDN portrait URL.** The original career-profile photo, repo-relative `assets/ec-photos/president/ranadhir-ghosh.jpg` in `banf1`, **does not exist anywhere** (the file is not in the repo — nothing to upload), and the source site's own career card image is broken (404) today. The Careers card avatar now uses the President's portrait already used on the site: `https://static.wixstatic.com/media/c62f94_d6f7e8a5b3c14f4f8a7f9e0d1c2b3a4d~mv2.jpg/v1/fill/w_180,h_180,al_c,q_80/rana.jpg`. Also recorded in PLACEMENT.md as resolved substitution M-1. | home.html (1, Careers & Professional Network card avatar) |

**Total: 0 tokens remaining. One placement-time media action remains:** place the flyer from the
Media Manager as a native image element on Home 2026 and Events, above the HTML component
(see PLACEMENT.md §Placement instructions, step 1).

## Images kept as-is (already on Wix CDN — no action)

- President's portrait in the President's Message (`static.wixstatic.com/media/c62f94_…/rana.jpg`) — home.html, about.html.
  The same portrait (180×180 fill) now also serves as the Careers card avatar in home.html — see the `__WIX_MEDIA_2__` resolution above.
- Executive Committee member photos for the 4 members who have them (Dr. Ranadhir Ghosh, Partha Mukhopadhyay,
  Rajanya Ghosh, Dr. Moumita Ghosh) — about.html (5 wixstatic references in total on that page, incl. the portrait).
  The other 4 EC members use gradient initial avatars in the source design — no image needed.
- All remaining visuals on the source site are CSS gradients / icon fonts / emoji (event cards, gallery album
  cards, sponsor tiers, radio vinyl) — they travel inside the HTML/CSS and need no media files.

## Explicitly NOT hotlinked

No markup in any generated file references github.io, raw.githubusercontent.com, or any repo-relative
path. Verified by grep: zero occurrences of "github" (any case) in all 8 files. The only external
media-domain references left are `static.wixstatic.com` (kept per the image rule) and ordinary
outbound links (BANF's own social profiles, YouTube/Spotify playlists, and the radio stations'
public stream URLs — links, not hotlinked images).
