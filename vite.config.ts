import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        level02_2d: resolve(__dirname, "pages/level02-2d.html"),
      },
    },
  },
});
