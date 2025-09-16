import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/utils.ts",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: ["bg-paymentMethod-bank", "bg-paymentMethod-ewallet"],
  theme: {
    extend: {
      opacity: {
        24: "0.24",
        48: "0.48",
        96: "0.96",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          light: "rgba(0, 136, 50, 0.08)",
          DEFAULT: "#267d36",
          icon: "#008832",
          bg: "#edfaf3",
          text: "#007A22",
          "bg-secondary": "#E6FFF9",
          "text-secondary": "#00C390",
        },
        error: {
          light: "rgba(230, 25, 14, 0.08)",
          DEFAULT: "#c40000",
          text: "#C40000",
          "bg-secondary": "#FFE6E6",
        },
        buy: {
          DEFAULT: "#29823b",
        },
        sell: {
          DEFAULT: "#dc2020",
        },
        warning: {
          bg: "#fff8e7",
          icon: "#f59e0b",
        },
        cyan: {
          hover: "#00bfea",
        },
        neutral: {
          7: "#6a7178",
          10: "#101213",
        },
        blue: {
          light: "rgba(55, 124, 252, 0.1)",
          DEFAULT: "#377cfc",
          50: "#E5F5FC",
          100: "#017AAD",
          200: "#00D0FF",
          800: "#0777C4",
        },
        grayscale: {
          DEFAULT: "100%",
          100: "#181C25B8",
          200: "#00000014",
          300: "#F8F9FA",
          400: "#CED4DA",
          700: "#EFF3F5",
          "text-primary": "#181C25",
          "text-muted": "#0000007A",
          "text-placeholder": "#0000003D",
        },
        yellow: {
          50: "#A66C00",
          100: "#FFF7E6",
        },
        orange: {
          50: "#ff9c1314",
        },
        green: {
          50: "#EAF3EB",
        },
        slate: {
          50: "#f8fafc",
          75: "#F6F7F8",
          100: "#f1f5f9",
          200: "#CED0D6",
          300: "#B1B4BC",
          400: "#9498A2",
          500: "#787D88",
          600: "#5C616D",
          700: "#414652",
          800: "#383D4A",
          900: "#303541",
          1000: "#282C38",
          1100: "#20242F",
          1200: "#181C25",
          1300: "#11141B",
          1400: "#000000",
          1500: "#F5F5F5",
          1600: "#333333",
        },

        teal: {
          700: "#00CCCC",
        },
        info: {
          light: "rgba(55, 124, 252, 0.1)",
          DEFAULT: "#377cfc",
          icon: "#377cfc",
          bg: "#e6f0ff",
        },
        pending: {
          light: "rgba(245, 158, 11, 0.1)",
          DEFAULT: "#f59e0b",
          icon: "#f59e0b",
          bg: "#fff8e7",
          "text-secondary": "#FF9C13",
        },
        completed: {
          light: "rgba(0, 136, 50, 0.08)",
          DEFAULT: "#267d36",
          icon: "#008832",
          bg: "#edfaf3",
        },
        cancelled: {
          light: "rgba(156, 163, 175, 0.1)",
          DEFAULT: "#6b7280",
          icon: "#6b7280",
          bg: "#f3f4f6",
        },
        disputed: {
          light: "rgba(230, 25, 14, 0.08)",
          DEFAULT: "#c40000",
          icon: "#c40000",
          bg: "#fee2e2",
        },
        "default-button-text": "#002A33",

        paymentMethod: {
          bank: "#74B816",
          ewallet: "#1A79CB",
        },
        red: {
          withdraw: "#E6190E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "xl-bold": ["1.125rem", { fontWeight: "700" }],
        "2xl-bold": ["1.5rem", { lineHeight: "2rem", fontWeight: "800" }],
      },
      spacing: {
        0.5: "0.125rem",
        1.5: "0.375rem",
        2.5: "0.625rem",
        3.5: "0.875rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        none: "none",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}

export default config
