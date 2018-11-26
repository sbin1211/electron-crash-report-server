module.exports = {
	extends: [
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:unicorn/recommended",
		"plugin:@tivac/svelte/svelte",
	],
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: "module",
	},
	plugins: ["html", "import", "unicorn", "@tivac/svelte"],
	settings: {
		"html/html-extensions": [".html", ".htmlx", ".svelte"],
	},
	rules: {
		/* =================================== */
		/* ✔ eslint:recommended                */
		/* ✘ unused                            */
		/* 🕇 custom                            */
		/* =================================== */

		/* =================================== */
		/* Possible Errors                     */
		/* =================================== */
		/* ✔ "for-direction": "error", */
		/* ✔ "getter-return": "error", */
		"no-async-promise-executor": "error",
		"no-await-in-loop": "error",
		/* ✔ "no-compare-neg-zero": "error", */
		/* ✔ "no-cond-assign": "error", */
		/* ✔ "no-console": "error", */
		/* ✔ "no-constant-condition": "error", */
		/* ✔ "no-control-regex": "error", */
		/* ✔ "no-debugger": "error", */
		/* ✔ "no-dupe-args": "error", */
		/* ✔ "no-dupe-keys": "error", */
		/* ✔ "no-duplicate-case": "error", */
		/* ✔ "no-empty": "error", */
		/* ✔ "no-empty-character-class": "error", */
		/* ✔ "no-ex-assign": "error", */
		/* ✔ "no-extra-boolean-cast": "error", */
		"no-extra-parens": "error",
		/* ✔ "no-extra-semi": "error", */
		/* ✔ "no-func-assign": "error", */
		/* ✔ "no-inner-declarations": "error", */
		/* ✔ "no-invalid-regexp": "error", */
		/* ✔ "no-irregular-whitespace": "error", */
		"no-misleading-character-class": "error",
		/* ✔ "no-obj-calls": "error", */
		"no-prototype-builtins": "error",
		/* ✔ "no-regex-spaces": "error", */
		/* ✔ "no-sparse-arrays": "error", */
		"no-template-curly-in-string": "error",
		/* ✔ "no-unexpected-multiline": "error", */
		/* ✔ "no-unreachable": "error", */
		/* ✔ "no-unsafe-finally": "error", */
		/* ✔ "no-unsafe-negation": "error", */
		"require-atomic-updates": "error",
		/* ✔ "use-isnan": "error", */
		"valid-jsdoc": "error",
		/* ✔ "valid-typeof": "error", */

		/* =================================== */
		/* Best Practices                      */
		/* =================================== */
		"accessor-pairs": "error",
		"array-callback-return": "error",
		"block-scoped-var": "error",
		"class-methods-use-this": "error",
		complexity: "error",
		"consistent-return": "error",
		curly: "error",
		"default-case": "error",
		/* 🕇 */ "dot-location": ["error", "property"],
		"dot-notation": "error",
		eqeqeq: "error",
		"guard-for-in": "error",
		"max-classes-per-file": "error",
		"no-alert": "error",
		"no-caller": "error",
		/* ✔ "no-case-declarations": "error", */
		"no-div-regex": "error",
		"no-else-return": "error",
		"no-empty-function": "error",
		/* ✔ "no-empty-pattern": "error", */
		"no-eq-null": "error",
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "error",
		"no-extra-label": "error",
		/* ✔ "no-fallthrough": "error", */
		"no-floating-decimal": "error",
		/* ✔ "no-global-assign": "error", */
		"no-implicit-coercion": "error",
		"no-implicit-globals": "error",
		"no-implied-eval": "error",
		"no-invalid-this": "error",
		"no-iterator": "error",
		"no-labels": "error",
		"no-lone-blocks": "error",
		"no-loop-func": "error",
		/* 🕇 */ "no-magic-numbers": ["error", { ignore: [-1, 0, 1, 10] }],
		"no-multi-spaces": "error",
		"no-multi-str": "error",
		"no-new": "error",
		"no-new-func": "error",
		"no-new-wrappers": "error",
		/* ✔ "no-octal": "error", */
		"no-octal-escape": "error",
		"no-param-reassign": "error",
		"no-proto": "error",
		/* ✔ "no-redeclare": "error", */
		/* ✘ "no-restricted-properties": [], */
		"no-return-assign": "error",
		"no-return-await": "error",
		"no-script-url": "error",
		/* ✔ "no-self-assign": "error", */
		"no-self-compare": "error",
		"no-sequences": "error",
		"no-throw-literal": "error",
		"no-unmodified-loop-condition": "error",
		"no-unused-expressions": "error",
		/* ✔ "no-unused-labels": "error", */
		"no-useless-call": "error",
		"no-useless-concat": "error",
		/* ✔ "no-useless-escape": "error", */
		"no-useless-return": "error",
		"no-void": "error",
		"no-warning-comments": "error",
		"no-with": "error",
		"prefer-promise-reject-errors": "error",
		radix: "error",
		"require-await": "error",
		"require-unicode-regexp": "error",
		"vars-on-top": "error",
		"wrap-iife": "error",
		yoda: "error",

		/* =================================== */
		/* Variables                           */
		/* =================================== */
		"init-declarations": "error",
		/* ✔ "no-delete-var": "error", */
		"no-label-var": "error",
		/* ✘ "no-restricted-globals": [], */
		"no-shadow": "error",
		"no-shadow-restricted-names": "error",
		/* ✔ "no-undef": "error", */
		"no-undef-init": "error",
		"no-undefined": "error",
		/* ✔ "no-unused-vars": "error", */
		"no-use-before-define": "error",

		/* =================================== */
		/* Node.js and CommonJs                */
		/* =================================== */
		"callback-return": "error",
		"global-require": "error",
		"handle-callback-err": "error",
		"no-buffer-constructor": "error",
		"no-mixed-requires": "error",
		"no-new-require": "error",
		"no-path-concat": "error",
		"no-process-env": "error",
		"no-process-exit": "error",
		/* ✘ "no-restricted-modules": [], */
		"no-sync": "error",

		/* =================================== */
		/* Stylistic Issues                    */
		/* =================================== */
		"array-bracket-newline": "error",
		"array-bracket-spacing": "error",
		/* 🕇 */ "array-element-newline": ["error", { multiline: true }],
		"block-spacing": "error",
		"brace-style": "error",
		camelcase: "error",
		"capitalized-comments": "error",
		/* 🕇 */ "comma-dangle": ["error", "always-multiline"],
		"comma-spacing": "error",
		"comma-style": "error",
		"computed-property-spacing": "error",
		"consistent-this": "error",
		"eol-last": "error",
		"func-call-spacing": "error",
		"func-name-matching": "error",
		"func-names": "error",
		"func-style": "error",
		/* 🕇 */ "function-paren-newline": ["error", "consistent"],
		/* ✘ "id-blacklist": [], */
		/* 🕇 */ "id-length": [
			"error",
			{ exceptions: ["a", "b", "h", "i", "n", "x"] },
		],
		"id-match": "error",
		"implicit-arrow-linebreak": "error",
		/* 🕇 */ indent: ["error", "tab"],
		"jsx-quotes": "error",
		"key-spacing": "error",
		"keyword-spacing": "error",
		"line-comment-position": "error",
		"linebreak-style": "error",
		"lines-around-comment": "error",
		"lines-between-class-members": "error",
		"max-depth": "error",
		/* 🕇 */ "max-len": ["error", { ignoreComments: true }],
		"max-lines": "error",
		"max-lines-per-function": "error",
		"max-nested-callbacks": "error",
		"max-params": "error",
		/* 🕇 */ "max-statements": ["error", 20],
		"max-statements-per-line": "error",
		"multiline-comment-style": "error",
		/* 🕇 */ "multiline-ternary": ["error", "always-multiline"],
		"new-cap": "error",
		"new-parens": "error",
		"newline-per-chained-call": "error",
		"no-array-constructor": "error",
		"no-bitwise": "error",
		"no-continue": "error",
		"no-inline-comments": "error",
		"no-lonely-if": "error",
		"no-mixed-operators": "error",
		/* ✔ "no-mixed-spaces-and-tabs": "error", */
		"no-multi-assign": "error",
		"no-multiple-empty-lines": "error",
		"no-negated-condition": "error",
		"no-nested-ternary": "error",
		"no-new-object": "error",
		"no-plusplus": "error",
		/* ✘ no-restricted-syntax: [], */
		/* 🕇 */ "no-tabs": ["error", { allowIndentationTabs: true }],
		/* 🕇 "no-ternary": "error", */
		"no-trailing-spaces": "error",
		"no-underscore-dangle": "error",
		"no-unneeded-ternary": "error",
		"no-whitespace-before-property": "error",
		"nonblock-statement-body-position": "error",
		"object-curly-newline": "error",
		/* 🕇 */ "object-curly-spacing": ["error", "always"],
		/* 🕇 */ "object-property-newline": [
			"error",
			{ allowAllPropertiesOnSameLine: true },
		],
		/* 🕇 */ "one-var": ["error", "never"],
		"one-var-declaration-per-line": "error",
		"operator-assignment": "error",
		"operator-linebreak": "error",
		/* 🕇 */ "padded-blocks": ["error", "never"],
		"padding-line-between-statements": "error",
		"prefer-object-spread": "error",
		/* 🕇 */ "quote-props": ["error", "as-needed"],
		quotes: "error",
		/* 🕇 "require-jsdoc": "error", */
		semi: "error",
		"semi-spacing": "error",
		"semi-style": "error",
		/* 🕇 */ "sort-keys": ["error", "asc", { natural: true }],
		"sort-vars": "error",
		"space-before-blocks": "error",
		/* 🕇 */ "space-before-function-paren": [
			"error",
			{
				anonymous: "never",
				asyncArrow: "always",
				named: "never",
			},
		],
		"space-in-parens": "error",
		"space-infix-ops": "error",
		"space-unary-ops": "error",
		"spaced-comment": "error",
		"switch-colon-spacing": "error",
		"template-tag-spacing": "error",
		"unicode-bom": "error",
		"wrap-regex": "error",

		/* =================================== */
		/* ECMAScript 6                        */
		/* =================================== */
		/* 🕇 */ "arrow-body-style": ["error", "as-needed"],
		/* 🕇 */ "arrow-parens": ["error", "as-needed"],
		"arrow-spacing": "error",
		/* ✔ "constructor-super": "error", */
		"generator-star-spacing": "error",
		/* ✔ "no-class-assign": "error", */
		"no-confusing-arrow": "error",
		/* ✔ "no-const-assign": "error", */
		/* ✔ "no-dupe-class-members": "error", */
		/* 🕇 */ "no-duplicate-imports": ["error", { includeExports: true }],
		/* ✔ "no-new-symbol": "error", */
		/* ✘ "no-restricted-imports": [], */
		/* ✔ "no-this-before-super": "error", */
		"no-useless-computed-key": "error",
		"no-useless-constructor": "error",
		"no-useless-rename": "error",
		"no-var": "error",
		"object-shorthand": "error",
		"prefer-arrow-callback": "error",
		"prefer-const": "error",
		/* 🕇 */ "prefer-destructuring": [
			"error",
			{
				array: true,
				object: true,
			},
			{
				enforceForRenamedProperties: true,
			},
		],
		"prefer-numeric-literals": "error",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		"prefer-template": "error",
		/* ✔ "require-yield": "error", */
		"rest-spread-spacing": "error",
		/* 🕇 */ "sort-imports": ["error", { ignoreCase: true }],
		"symbol-description": "error",
		"template-curly-spacing": "error",
		"yield-star-spacing": "error",

		/* =================================== */
		/* Plugins                             */
		/* =================================== */
		"@tivac/svelte/property-ordering": [
			"error",
			{
				order: [
					"actions",
					"components",
					"computed",
					"data",
					"events",
					"helpers",
					"immutable",
					"methods",
					"namespace",
					"oncreate",
					"ondestroy",
					"onstate",
					"onupdate",
					"preload",
					"props",
					"setup",
					"store",
					"tag",
					"transitions",
				],
			},
		],
	},
};
