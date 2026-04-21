import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                card: {
                    DEFAULT: "var(--card-bg)",
                    foreground: "var(--text-primary)",
                },
                // Custom app colors
                "app-bg": "var(--app-bg)",
                "surface": "var(--surface-bg)",
                "text-primary": "var(--text-primary)",
                "text-secondary": "var(--text-secondary)",
            },
            borderColor: {
                DEFAULT: "var(--border-color)",
                muted: "var(--border-muted)",
            },
        },
    },
    plugins: [],
};
export default config;


