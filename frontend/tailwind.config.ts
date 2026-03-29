import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // -------------------------------------------------------
      // Color Palette — from WIREFRAMES.md Section 1.1
      // -------------------------------------------------------
      colors: {
        pink: {
          soft: "#F8B4C8",   // Primary accent, buttons, highlights
          light: "#FDE8EF",  // Card backgrounds, hover states
          deep: "#E87FA3",   // Button active states, focus rings
        },
        purple: {
          light: "#C9B8E8",  // Secondary accent, tags, badges
          soft: "#EDE6F8",   // Section backgrounds, dividers
          deep: "#9B84D4",   // Headings, icon accents
        },
        gold: {
          warm: "#E8C87A",   // Timestamps, special callouts, star icons
          light: "#FBF0D0",  // Gold accent backgrounds
        },
        site: {
          white: "#FAFAFA",        // Page background, card base
          "white-pure": "#FFFFFF", // Input fields, modal backgrounds
          dark: "#2D2D2D",         // General dark (used for contrast elements)
        },
        text: {
          primary: "#3A2D4F",  // Body text (deep purple-black)
          muted: "#8A7FA0",    // Placeholder text, captions
        },
        border: {
          DEFAULT: "#E8D8EC",  // Input borders, card outlines
        },
        error: "#D9534F",      // Error messages, destructive actions
        success: "#5BAD8F",    // Success toasts, save confirmations
      },

      // -------------------------------------------------------
      // Font Families — from WIREFRAMES.md Section 1.2
      // Uses CSS variables injected by next/font/google in layout.tsx
      // -------------------------------------------------------
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-lato)", "Lato", "Helvetica Neue", "sans-serif"],
      },

      // -------------------------------------------------------
      // Font Sizes — from WIREFRAMES.md Section 1.2
      // -------------------------------------------------------
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["2.0rem", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["1.0rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        btn: ["0.9375rem", { lineHeight: "1.0", fontWeight: "600" }],
        nav: ["0.9375rem", { lineHeight: "1.0", fontWeight: "500" }],
        timestamp: ["0.8125rem", { lineHeight: "1.0", fontWeight: "400" }],
      },

      // -------------------------------------------------------
      // Spacing Scale — from WIREFRAMES.md Section 1.3
      // -------------------------------------------------------
      spacing: {
        micro: "4px",
        tight: "8px",
        sm: "12px",
        base: "16px",
        section: "24px",
        card: "32px",
        gap: "48px",
        "gap-lg": "64px",
        page: "96px",
      },

      // -------------------------------------------------------
      // Border Radius — from WIREFRAMES.md Section 1.4
      // -------------------------------------------------------
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        pill: "9999px",
        circle: "50%",
      },

      // -------------------------------------------------------
      // Box Shadows — from WIREFRAMES.md Section 1.5
      // -------------------------------------------------------
      boxShadow: {
        subtle: "0 2px 8px rgba(155, 132, 212, 0.10)",
        hover: "0 6px 20px rgba(155, 132, 212, 0.22)",
        modal: "0 12px 40px rgba(58, 45, 79, 0.18)",
        focus: "0 0 0 3px rgba(248, 180, 200, 0.55)",
      },

      // -------------------------------------------------------
      // Keyframe Animations — referenced by globals.css @layer utilities
      // -------------------------------------------------------
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "20%": { opacity: "1" },
          "80%": { opacity: "0.4" },
          "100%": { opacity: "0", transform: "translateY(-200px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(120%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideOutRight: {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(120%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        heartPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        floatUp: "floatUp linear infinite",
        shimmer: "shimmer 1.5s infinite linear",
        slideInRight: "slideInRight 250ms ease-out forwards",
        slideOutRight: "slideOutRight 250ms ease-in forwards",
        fadeIn: "fadeIn 200ms ease-out forwards",
        scaleIn: "scaleIn 200ms ease-out forwards",
        heartPulse: "heartPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
