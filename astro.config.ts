import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    "/": { status: 302, destination: "/lv/" },
  },
});
