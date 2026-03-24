/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./index.html",        
  ],
  theme: {
    extend: {
      fontFamily:{
        mono: ['"IBM Plex Mono"', '"Courier New"','Courier', 'monospace'],
        display: ['"IBM Plex Mono"', '"Courier New"','Courier', 'monospace'],
        sans: ['"IBM Plex Mono"', '"Courier New"','Courier', 'monospace'],
      },
      colors: {
        brand: {
          canvas: withOpacity("--brand-canvas"),
          haze: withOpacity("--brand-haze"),
          surface: withOpacity("--brand-surface"),
          contrast: withOpacity("--brand-contrast"),
          panel: withOpacity("--brand-panel"),
          line: withOpacity("--brand-line"),
          frame: withOpacity("--brand-frame"),
          ink: withOpacity("--brand-ink"),
          muted: withOpacity("--brand-muted"),
          accent: withOpacity("--brand-accent"),
          "accent-strong": withOpacity("--brand-accent-strong"),
          hero: withOpacity("--brand-hero"),
          "warning-soft": withOpacity("--brand-warning-soft"),
          "warning-ink": withOpacity("--brand-warning-ink"),
          "info-soft": withOpacity("--brand-info-soft"),
          "info-ink": withOpacity("--brand-info-ink"),
          "success-soft": withOpacity("--brand-success-soft"),
          "success-ink": withOpacity("--brand-success-ink"),
          "neutral-soft": withOpacity("--brand-neutral-soft"),
          "neutral-ink": withOpacity("--brand-neutral-ink"),
          "danger-soft": withOpacity("--brand-danger-soft"),
          "danger-ink": withOpacity("--brand-danger-ink"),
        },
      },
      boxShadow: {
        card: "0 12px 30px rgb(var(--brand-shadow-ink) / 0.08), 0 2px 8px rgb(var(--brand-shadow-ink) / 0.05)",
        sign: "0 18px 40px rgb(var(--brand-shadow-ink) / 0.14), 0 3px 12px rgb(var(--brand-shadow-frame) / 0.08)",
      },
    }, 
  },
  plugins: [require('@tailwindcss/typography')],
};
