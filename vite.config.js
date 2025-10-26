import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  decodeURI;

  const lang = env.VITE_LAN || "fr";

  const basename = `/${lang}/`;

  return {
    base: basename,
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      allowedHosts: ["dev-redactionnelle.aps.dz", "redactionnelle.aps.dz"],
      hmr: {
        host: "dev-redactionnelle.aps.dz",
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        path: "path-browserify",
      },
    },
  };
});
