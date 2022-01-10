/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    public: "/",
    src: "/dist",
  },
  plugins: ["@snowpack/plugin-svelte", "@snowpack/plugin-postcss"],
  optimize: {
    bundle: true,
    minify: true,
    treeshake: true,
    sourcemap: false,
    target: "es2018",
  },
};
