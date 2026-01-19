/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'ui-sans-serif', 'system-ui'], // Outfit for body text
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'], // JetBrains Mono for code
      },
    },
  },
};
