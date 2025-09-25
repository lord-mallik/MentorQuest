# Accessibility Features Implementation TODO

## Overview
Implementing the accessibility features: Light Theme, Medium Text Size, Dyslexic-friendly Font, High Contrast, Reduced Motion, and Voice Enabled. The UI and hook are already in place; focus on CSS styles to make them visually functional.

## Steps

### 1. Import Dyslexic-friendly Font
- [x] Add import for Atkinson Hyperlegible font in src/index.css (dyslexia-friendly and highly legible).
- Dependent: None.
- Status: Completed.

### 2. Add CSS Variable for Base Font Size
- [x] Define `html { font-size: var(--font-size-base, 1rem); }` in src/index.css to apply text size preference globally.
- Dependent: usePreferences.ts already sets the var.
- Status: Completed.

### 3. Implement Dyslexic Font Class
- [x] Add `--font-family-dyslexic: 'Atkinson Hyperlegible', sans-serif;` in :root.
- [x] Add `.dyslexic-font { font-family: var(--font-family-dyslexic) !important; }` to apply to all elements when class is on html.
- Dependent: usePreferences.ts adds .dyslexic-font to html.
- Status: Completed.

### 4. Implement High Contrast Class
- [x] Add `.high-contrast` styles: Override colors for higher contrast (e.g., black text on white bg, stronger borders, etc.).
- [x] Example: `.high-contrast { --color-neutral-900: #000; --color-neutral-100: #fff; filter: contrast(1.2); border-width: 2px on key elements; }`
- Dependent: usePreferences.ts adds .high-contrast to html.
- Status: Completed.

### 5. Implement Reduced Motion Class
- [x] Add `.reduced-motion *, .reduced-motion *::before, .reduced-motion *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }` to reinforce the media query.
- Dependent: usePreferences.ts adds .reduced-motion to html; existing media query handles prefers-reduced-motion.
- Status: Completed.

### 6. Voice Enabled (Placeholder)
- [x] The CSS var --voice-enabled is set in usePreferences.ts; no visual changes needed, but ensure it's available for future TTS JS integration.
- Dependent: None (non-visual).
- Status: Already functional as var.

### 7. Testing and Verification
- [] Toggle each preference in Profile.tsx and verify visual changes (e.g., run dev server, check browser).
- [] Use browser dev tools to inspect html classes and styles.
- [] Test with screen reader/voice if possible (future TTS).
- Dependent: All above steps.
- Status: Pending.

## Follow-up
- After all steps, remove this TODO.md or mark as complete.
- If issues, update plan based on testing.
