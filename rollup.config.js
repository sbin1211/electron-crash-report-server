import closureCompiler from '@ampproject/rollup-plugin-closure-compiler'
import filesize from 'rollup-plugin-filesize'
import { readdirSync } from "fs";
import { resolve } from "path";
import svelte from "rollup-plugin-svelte";

const directory = resolve("components");
const input = readdirSync(directory).map(x => resolve(directory, x));
const production = !process.env.ROLLUP_WATCH;

export default {
	experimentalCodeSplitting: true, // Rollup v1 default.
	input,
	output: {
		dir: "out",
		format: "esm",
		sourcemap: true,
	},
	plugins: [
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
