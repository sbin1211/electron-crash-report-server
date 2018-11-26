/* eslint-disable no-process-env */

import closureCompiler from "@ampproject/rollup-plugin-closure-compiler";
import commonjs from "rollup-plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import nodeResolve from "rollup-plugin-node-resolve";
import { readdirSync } from "fs";
import { resolve } from "path";
import svelte from "rollup-plugin-svelte";

const directory = resolve("components");
const input = readdirSync(directory).map(x => resolve(directory, x));
const production = !process.env.ROLLUP_WATCH;

export default {
	// Rollup v1 default.
	experimentalCodeSplitting: true,
	input,
	output: {
		dir: "out",
		format: "esm",
		sourcemap: true,
	},
	plugins: [
		commonjs(),
		nodeResolve(),
		svelte({
			dev: !production,
			// Svelte v3 defaults.
			nestedTransitions: true,
			skipIntroByDefault: true,
		}),
		production && closureCompiler(),
		production && filesize(),
	],
};
