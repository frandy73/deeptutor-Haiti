---
name: Pwof Ou
colors:
  surface: '#0f131f'
  surface-dim: '#0f131f'
  surface-bright: '#353946'
  surface-container-lowest: '#0a0e1a'
  surface-container-low: '#171b28'
  surface-container: '#1b1f2c'
  surface-container-high: '#262a37'
  surface-container-highest: '#313442'
  on-surface: '#dfe2f3'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dfe2f3'
  inverse-on-surface: '#2c303d'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#ffb1c7'
  on-tertiary: '#650031'
  tertiary-container: '#bd0062'
  on-tertiary-container: '#ffcfdb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffd9e2'
  tertiary-fixed-dim: '#ffb1c7'
  on-tertiary-fixed: '#3f001c'
  on-tertiary-fixed-variant: '#8e0048'
  background: '#0f131f'
  on-background: '#dfe2f3'
  surface-variant: '#313442'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system for this educational platform balances the disciplined structure of a productivity tool with the high-energy, rewarding nature of a gamified learning app. It is designed to feel like an "Encouraging AI Friend"—authoritative enough to trust with academic progress, but playful enough to sustain daily engagement.

The aesthetic is a hybrid of **Modern Corporate** (precision and clarity) and **Glassmorphism** (depth and vibrancy). It utilizes high-saturation gradients and emoji-forward iconography to create an optimistic atmosphere. The target audience—Haitian students—should feel that the interface is premium, contemporary, and deeply supportive. Every interaction is designed to feel "juicy" and responsive, celebrating small wins through visual feedback.

## Colors
The palette is rooted in a "Twilight" spectrum, transitioning from deep indigo to vibrant pink. This gradient is the signature of the brand, used for primary actions, progress indicators, and "celebration" states.

- **Primary Gradient:** A linear 135-degree flow from Indigo (#4f46e5) to Purple (#7c3aed) to Pink (#db2777).
- **Backgrounds:** The default state is a deep, tech-centric dark mode (#0a0e1a) to reduce eye strain during late-night study sessions. The light mode uses a soft, tinted off-white (#f0f4ff) to maintain brand cohesion.
- **Semantic Colors:** Emerald (#10b981) for correct answers and XP gains; Amber (#f59e0b) for streak warnings and reminders.

## Typography
This design system relies on **Inter** for its exceptional legibility and modern, systematic feel. 

- **Hierarchy:** High-level headings (Display LG) use a heavy 800 weight with tight letter spacing. These are the primary candidates for the signature brand gradient.
- **Readability:** Body text is kept clean and spacious. 
- **Emphasis:** Bold weights are used frequently for instructional text to mimic the clarity of Notion's information architecture.
- **Mobile Adaption:** Display sizes scale down by approximately 20% on mobile to ensure impact without overwhelming the viewport.

## Layout & Spacing
The layout uses a **Fluid Grid** approach optimized for mobile-first interaction. 

- **Grid:** A 4-column grid for mobile and an 8-column grid for tablet. 
- **Rhythm:** An 8px base unit drives all padding and margins.
- **Margins:** Standard 20px safe areas on the left and right of mobile screens to allow cards to breathe.
- **Grouping:** Use `sm` (12px) for internal card padding and `md` (24px) for vertical spacing between distinct content sections.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and soft, colored shadows rather than traditional grey-scale shadows.

- **Glass Surfaces:** Cards in dark mode use a fill of #161d33 at 85% opacity with a 12px backdrop blur and a subtle 1px inner border (white at 10% opacity) to simulate a glass edge.
- **Shadows:** Use "Ambient Glow" for active elements. Instead of black, use a semi-transparent version of the primary purple (#7c3aed at 20% opacity) with a large blur radius (20px-30px) for high-elevation components like Modals or Floating Action Buttons.
- **Headers:** Navigation bars are persistently glassmorphic, allowing content to scroll underneath with a blurred preview.

## Shapes
The shape language is friendly and "bouncy." 

- **Standard Elements:** Buttons and Input fields use a 12px (`rounded-md`) radius.
- **Containers:** Content cards and Modals use a more pronounced 24px (`rounded-xl`) radius to feel approachable.
- **Visual Style:** Avoid sharp 90-degree angles entirely. Even progress bars and tags should use fully rounded (pill-shaped) caps to maintain the "playful" brand pillar.

## Components
- **Buttons:** Primary buttons feature the Indigo-to-Pink gradient. On hover or tap, they should scale to 1.02x. Implement a white radial ripple effect that originates from the point of contact.
- **Glass Cards:** High-contrast containers with the backdrop blur effect. Use these for lesson modules and XP summaries.
- **Inputs:** Dark mode inputs use a slightly darker fill than the card background with a 1px border that glows into the primary gradient when focused.
- **Toasts & Modals:** Toasts should slide in from the top with an emoji icon representing the message type (e.g., 🔥 for streaks, 🏆 for achievements). Modals use a full-screen backdrop blur (4px) to focus the user.
- **Skeleton Loaders:** Use a shimmer animation that moves the primary gradient at a low opacity (10%) across the skeleton shapes from left to right.
- **Gamification Elements:** Chips (tags) for "Difficulty" or "Subject" should use semi-transparent fills of the primary colors with bold, white text.