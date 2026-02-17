# Design System: Mmakwany Guest House — Unified Hospitality Platform
**Project ID:** 2092021926000375726

## 1. Visual Theme & Atmosphere

Mmakwany Guest House radiates a **warm, inviting, and trustworthy** aesthetic inspired by the clean simplicity of Airbnb and the operational gravitas of modern SaaS dashboards. The guest-facing experience is **airy, spacious, and image-driven** — generous whitespace frames rich photography of halls, rooms, and cuisine. The staff-facing dashboard pivots to a **dense, dark, information-rich** environment optimized for rapid decision-making under operational pressure.

The overall philosophy: **"Premium hospitality, zero friction."** Every surface feels intentional — soft shadows suggest depth without heaviness, and the teal accent color evokes trust, calm, and Kenyan hospitality.

## 2. Color Palette & Roles

### Guest-Facing (Light Theme)
| Descriptive Name | Hex Code | Functional Role |
|---|---|---|
| Warm Cloud White | `#FAFAFA` | Page background — a gentle off-white that reduces eye strain |
| Pure White | `#FFFFFF` | Card surfaces, modals, form containers — elevated content |
| Rich Hospitality Teal | `#0D9488` | Primary accent — buttons, active links, selection states, CTAs |
| Warm Kenyan Gold | `#D97706` | Pricing highlights, premium badges, totals — draws the eye to value |
| Deep Charcoal | `#1F2937` | Primary text — headings, labels, critical information |
| Medium Slate Gray | `#6B7280` | Secondary text — descriptions, captions, metadata |
| Soft Border Gray | `#E5E7EB` | Dividers, input borders, card outlines |
| Success Emerald | `#10B981` | Confirmation states, success messages, available indicators |
| Alert Amber | `#F59E0B` | Pending states, warnings, expiring quotes |

### Staff-Facing (Dark Theme)
| Descriptive Name | Hex Code | Functional Role |
|---|---|---|
| Deep Midnight Slate | `#0F172A` | Dashboard background — a rich, non-pure-black that's easy on the eyes |
| Dark Surface Slate | `#1E293B` | Card backgrounds, sidebar panels, elevated sections |
| Subtle Border Charcoal | `#334155` | Card borders, dividers, table lines |
| Ice White | `#F8FAFC` | Primary text on dark surfaces |
| Cool Muted Gray | `#94A3B8` | Secondary text, labels, inactive nav items |
| Operational Teal | `#0D9488` | Active navigation, primary buttons, key metrics |
| Status Red | `#EF4444` | Cancelled bookings, critical alerts, danger actions |

## 3. Typography Rules

- **Font Family:** Inter (Google Fonts) — a clean, geometric sans-serif that renders crisply at all sizes. Falls back to system `sans-serif`.
- **Heading Weight:** `700` (Bold) — commanding presence for section titles, hall names, and pricing totals.
- **Subheading Weight:** `600` (Semi-Bold) — used for card titles, labels, and navigation items.
- **Body Weight:** `400` (Regular) — descriptions, paragraphs, form labels.
- **Letter Spacing:** Tight for headings (`-0.02em`), natural for body text (`0`).
- **Size Scale:** Large hero text (3rem), section headings (1.75rem), card titles (1.25rem), body (1rem), captions (0.875rem).

## 4. Component Stylings

* **Buttons:**
  - **Primary:** Generously rounded corners (`12px`), filled with Rich Hospitality Teal, white text. Subtly darkens on hover. Full-width on mobile, auto-width on desktop.
  - **Secondary/Outline:** Same rounded corners, transparent fill with teal border and teal text. Fills with teal on hover.
  - **Danger:** Same shape, filled with Status Red for destructive actions.

* **Cards/Containers:**
  - Generously rounded corners (`16px`), Pure White background on light theme, Dark Surface Slate on dark theme.
  - Whisper-soft shadows (`0 2px 8px rgba(0,0,0,0.08)`) — just enough elevation to separate from the page.
  - Subtle upward lift on hover (`translateY(-2px)`) with shadow deepening — invites interaction.

* **Inputs/Forms:**
  - Subtly rounded (`8px`), 1px Soft Border Gray stroke, transparent fill that transitions to a faint teal border on focus.
  - Pill-shaped filter inputs for search bars and filter strips (`border-radius: 9999px`).

* **Badges/Pills:**
  - Pill-shaped (`border-radius: 9999px`), teal background with white text for capacity and status.
  - Gold background with dark text for pricing highlights.
  - Color-coded status badges: Emerald for confirmed, Amber for pending, Red for cancelled.

* **Navigation:**
  - Clean horizontal bar on guest pages, vertical sidebar on admin dashboard.
  - Active state indicated by teal color and subtle underline (guest) or background highlight (admin).

## 5. Layout Principles

- **Mobile-First, Desktop-Optimized:** All guest pages are responsive, designed to work beautifully on phones first, then expanded for tablets and desktops.
- **Generous Whitespace:** Content breathes — minimum `24px` padding within cards, `32px` gaps in grids, `80px` section spacing on desktop.
- **12-Column Grid:** Desktop uses a max-width `1280px` container with a 12-column grid. Hall cards sit in 3 columns, configurator uses a 60/40 split.
- **Sticky Elements:** Configuration panels, bottom quote summary bars, and mobile CTAs remain fixed during scroll to keep actions always accessible.
- **Image-First Hierarchy:** Photographs dominate the top fold of all guest-facing pages — at least 40% of viewport on initial load.

## 6. Design System Notes for Stitch Generation

When generating new NexusStay screens with Stitch, always include this design block in prompts:

```
**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first, responsive
- Theme: Light (guest) / Dark (staff), clean modern hospitality aesthetic
- Background: Warm White (#FAFAFA) guest / Deep Slate (#0F172A) staff
- Surface: Pure White (#FFFFFF) / Dark Card (#1E293B)
- Primary Accent: Rich Teal (#0D9488) for buttons, links, active states
- Secondary Accent: Warm Gold (#D97706) for pricing and premium badges
- Text Primary: Deep Charcoal (#1F2937) / Ice White (#F8FAFC)
- Text Secondary: Medium Gray (#6B7280) / Cool Gray (#94A3B8)
- Buttons: Rounded (12px), teal filled with hover darkening
- Cards: Rounded (16px), subtle shadow, hover lift
- Typography: Inter font, clean hierarchy
- Status Colors: Green (#10B981) confirmed, Amber (#F59E0B) pending, Red (#EF4444) cancelled
```
