"use strict"

import typescript from "rollup-plugin-typescript2"

export default {
    input: "./src/index.ts",
    output: {
        file: "dist/index.js",
        sourcemap: true,
        format: "cjs",
    },
    plugins: [
        typescript({
            exclude: ["**/*.test.ts"],
        }),
    ],
}
