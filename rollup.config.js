// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/src/index.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/prop.js",
      format: "iife",
      name: "PropStyle",
    },
    {
      file: "dist/prop.min.js",
      format: "iife",
      name: "PropStyle",
      plugins: [terser()],
    },
    {
      file: "dist/prop.esm.js",
      format: "es",
    },
  ],
  plugins: [resolve(), commonjs()],
};
