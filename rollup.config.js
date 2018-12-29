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
	input,
	output: { dir: "build", format: "esm", sourcemap: true },
	plugins: [
		svelte({
			css: false,
			dev: !production,
			hydratable: true,
			// Opt-in to v3 behavior.
			nestedTransitions: true,
			skipIntroByDefault: true,
		}),
		commonjs(),
		nodeResolve(),
		production && closureCompiler(),
		production && filesize(),
	],
};
