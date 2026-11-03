# FreshCheck design system

## Philosophy and brand
FreshCheck makes the contents of a container understandable in seconds. Calm, practical, food-oriented design; clear dates and time-based guidance take precedence over decoration. Primary slogan: “Scan It, Track It, Keep It Fresh.” Supporting message: “Less Waste, More Freshness.”

This document follows the plain Markdown design-system methodology described at https://github.com/voltagent/awesome-design-md: explicit visual principles, reusable tokens, component rules, and implementation constraints. It does not copy another brand’s website.

The reference is a poster, not a standalone logo. `src/components/Brand.tsx` uses an original text treatment with Lucide leaf/check icons. Replace this component with an accessible local transparent SVG/PNG when approved artwork becomes available. Do not crop the poster into a navbar logo. `src/assets/food-containers.svg` is a lightweight, original code-native illustration inspired by the exhibition containers. Its label motifs are decorative, not scannable QR codes.

## Tokens
- Forest/action: `--forest: #155b36`; primary text `--ink: #19392b`.
- Supporting green: `#46782b`; wordmark accent `#4e7b26`.
- Botanical accent: `--lime: #bde16b`; never use as small text on white.
- Canvas: `#fbfcf8`; surface `--surface: #f0f4e9`; white form/detail surfaces.
- Secondary text: `--muted: #5e7066`; borders `--line: #dce4d9`.
- Fresh: text `#185b35`, background `#e2efda`, circle check icon.
- Use Soon: text `#79510b`, background `#fff0c7`, clock icon.
- Check Before Use: text `#9d302b`, background `#fbe4df`, circle alert icon.
- Radius: 7–8px controls, 12px list items, `--radius: 16px` primary surfaces.
- No elevation by default. Prefer a visible border and section background to shadows.

## Typography and rhythm
Use the local system sans-serif stack; no essential remote font. Body 14–17px, line-height 1.7; supporting labels 12px. Hero 40–64px, page titles 34–52px, section headings 27–38px. Headings use restrained negative tracking and 1.06–1.14 line-height. Uppercase eyebrows use 11px with 1.7px tracking, never paragraphs.

Spacing follows a roughly 4px base: 8, 12, 16, 20, 24, 32, 40, 56, 64, 72. Container max 1120px; gutters 24px desktop, 16px mobile. Narrow forms max 720px.

## Layout, surfaces, navigation
Desktop hero: two columns, copy before food illustration. Benefits are an inline band. How-it-works articles use top rules rather than floating cards. Forms and QR details receive bounded white surfaces for readability. Foods are two columns on desktop, one on mobile. Detail view has a flexible content column and 320px QR sidebar; below 700px, details come first and QR follows.

Navbar contains the wordmark and Home, Foods, Add Food links. Active routes have color and underline. At 375px and below navigation wraps into a second row without hiding actions. Footer remains minimal. Do not make every component a floating card.

## Components and states
Buttons have 46px minimum height, explicit text, optional 16–18px icons, 8px corners. Primary uses forest/white; secondary uses outline. Hover darkens or changes the surface. Focus uses a visible 3px green outline with 4px offset. Disabled saving controls show a busy label and reduced opacity.

Forms use persistent labels, required attributes, browser-native date/number validation and shared service validation. Inputs are at least 46px tall, full width, with visible borders. Notes resize vertically. Authentication is a small separate organizer panel, not a prerequisite for public reading. Show friendly errors near the action with role=alert. Loading is communicated in text with role=status.

Status badges always combine icon + exact state label + color. Exactly three primary states exist. Never interpret green as proof that food is safe. State guidance and disclaimer must be visible on food detail pages.

## QR presentation and printing
QR codes are black on white with four-module margins; never place artwork over them. Render the downloadable canvas at 720px, display at up to 240px. The print label contains FreshCheck, food name, QR, and “Scan to check freshness.” Print CSS hides navigation, controls and calculated guidance. Never permanently print the calculated status. PNG downloads contain the QR alone; print produces the branded label. Long URLs wrap. Warn when labels encode localhost.

## Responsive and accessibility rules
Target widths: 320, 375, 390, 430, 768, 1024, 1440. Never require horizontal scrolling. Allow food names and notes to wrap. Keep QR proportional. Preserve source order: title/status, storage information, disclaimer, then QR. At narrow widths stack action buttons and date metrics as needed.

Use semantic header/nav/main/footer, native form controls, associated labels, visible keyboard focus, a skip link, and text alternatives. Decorative icons are hidden where the adjacent label supplies meaning. All status meaning must survive monochrome rendering. Respect reduced-motion preferences; avoid essential motion. Use readable dark text on pale surfaces. Native semantic HTML takes priority over custom ARIA.

## Do / don't
Do use calm green, warm neutrals, editorial spacing, clear actions, and factual date guidance. Do use local assets. Do expose useful loading, empty and error states. Don't use excessive gradients, fake fixed food statuses, AI predictions, NFC, enormous shadows, remote branding assets, or claims of guaranteed food safety.
