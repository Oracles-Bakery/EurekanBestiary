/** @type {import("snowpack").SnowpackUserConfig } */
export default {
    mount: {
        public: "/",
        src: "/dist",
    },
    routes: [{match: "routes", src: ".*", dest: "index.html"}],
    plugins: ["@snowpack/plugin-svelte", "@snowpack/plugin-postcss"],
    optimize: {
        bundle: true,
        minify: true,
        treeshake: true,
        sourcemap: false,
        target: "es2018",
    },
    devOptions: {
        tailwindConfig: "./tailwind.config.js",
    },
};
