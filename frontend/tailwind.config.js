/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./index.html",        
  ],
  theme: {
    extend: {
      fontFamily:{
        mono: ['"IBM Plex Mono"', '"Courier New"','Courier', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
          overlay: withOpacity("--brand-overlay"),
        },
      },
      boxShadow: {
        card: "0 1px 3px rgb(var(--brand-contrast) / 0.04), 0 1px 2px rgb(var(--brand-contrast) / 0.04)",
        sign: "0 4px 12px rgb(var(--brand-contrast) / 0.06), 0 1px 4px rgb(var(--brand-contrast) / 0.04)",
      },
      opacity: {
        12: "0.12",
        14: "0.14",
        16: "0.16",
        18: "0.18",
        22: "0.22",
        24: "0.24",
        28: "0.28",
        34: "0.34",
        42: "0.42",
        48: "0.48",
        56: "0.56",
        72: "0.72",
        78: "0.78",
        82: "0.82",
        86: "0.86",
        92: "0.92",
        96: "0.96",
      },
    }, 
  },
  plugins: [require('@tailwindcss/typography')],
};
