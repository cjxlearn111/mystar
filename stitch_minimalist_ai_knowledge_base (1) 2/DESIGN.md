---
name: Ethereal Journal
colors:
  surface: '#faf8fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf8fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5d5e60'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe1'
  on-secondary-container: '#616365'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001b3f'
  on-tertiary-container: '#2b82f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e2e2e4'
  secondary-fixed-dim: '#c6c6c8'
  on-secondary-fixed: '#1a1c1d'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#abc7ff'
  on-tertiary-fixed: '#001b3f'
  on-tertiary-fixed-variant: '#00458f'
  background: '#faf8fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 72px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1120px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is centered on a high-end, editorial aesthetic that bridges the gap between a personal knowledge base and a premium digital publication. It targets an audience that values intellectual depth and visual serenity. 

The style is **Minimalist-Glassmorphic**, inspired by the precision of high-end consumer electronics and luxury editorial layouts. It utilizes expansive whitespace, a restrained monochromatic palette, and translucent layers to create a sense of breathability and focus. The emotional response should be one of "quiet authority"—professional, calm, and meticulously curated.

## Colors
The palette is rooted in a spectrum of neutrals to ensure long-form content remains the primary focus. 

- **Primary:** A deep, near-black charcoal used for primary text and high-contrast UI elements.
- **Secondary:** A soft, neutral off-white (Alabaster) used for page backgrounds and large surface areas to reduce eye strain.
- **Tertiary:** A refined blue accent, used sparingly for interactive highlights or subtle call-to-actions, maintaining a professional demeanor.
- **Neutral:** A mid-tone gray for metadata, captions, and secondary borders, providing hierarchy without visual clutter.

## Typography
Typography is the cornerstone of this design system. It employs a high-contrast serif for headings to evoke the feeling of a printed luxury journal, paired with a highly legible sans-serif for functional content.

- **Headlines:** Use high-contrast serif scales to create a clear editorial rhythm. Display sizes should utilize tighter letter spacing.
- **Body:** Set with generous line-height to maximize readability in long-form knowledge base articles. 
- **Labels:** Small-scale sans-serif, often in uppercase with increased tracking, is used for metadata like tags, dates, or "Reading Time" indicators.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for content readability, centered within a fluid viewport. 

- **Desktop:** A 12-column grid with a 1120px max-width container. Large 64px outer margins create a "frame" effect around the content.
- **Vertical Rhythm:** Spacing is strictly based on 8px increments. Large sections of content are separated by significant vertical gaps (80px to 120px) to maintain the minimalist feel.
- **Mobile:** Transition to a 4-column grid with reduced margins. Content remains centered, with images typically extending to the edge of the safe area.

## Elevation & Depth
Depth is communicated through **Glassmorphism** and subtle tonal stacking rather than heavy shadows.

1.  **Base Layer:** The off-white secondary color.
2.  **Interactive Layer:** Floating navigation bars and tooltips utilize a `backdrop-filter: blur(20px)` with a semi-transparent white fill (80% opacity) and a 1px soft-white stroke.
3.  **Depth Cues:** Shadows are almost non-existent. Where necessary, use a "natural" shadow: 0px 4px 20px with 4% opacity of the primary color to indicate slight lift without breaking the flat aesthetic.

## Shapes
The shape language is "Soft," utilizing tight radii to maintain a professional and structured feel. While rounded, the corners are precise and intentional, avoiding the overly "bubbly" appearance of consumer social apps. Larger elements like cards and main containers should use `rounded-lg` (8px) to soften the overall composition.

## Components
- **Buttons:** Primary buttons are solid deep gray with white text. Secondary buttons are "Ghost" style—a simple 1px border with the accent blue or deep gray.
- **Cards:** Borderless with a slightly lighter background than the page, or defined by a 1px soft-gray border. No heavy drop shadows.
- **Glass Navigation:** A sticky header that blurs the content underneath as the user scrolls, creating a sense of physical layering.
- **Inputs:** Minimalist underlines or 1px strokes that darken on focus. Use the sans-serif font for all user input to ensure clarity.
- **Chips/Tags:** Small, pill-shaped markers with low-contrast backgrounds (e.g., a 5% opacity tint of the accent color) to keep them from distracting from the text.
- **Information Architecture:** Utilize breadcrumbs and "related reading" modules at the bottom of articles, styled with the serif `headline-md` to maintain the editorial voice.