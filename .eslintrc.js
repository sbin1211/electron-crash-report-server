module.exports = {
	extends: ["oz"],
	overrides: [
		{
			files: "*.svelte",
			globals: {
				document: true,
				fetch: true,
				localStorage: true,
				window: true,
			},
			// Svelte 3 overrides:
			// - import/no-mutable-exports
			// - import/prefer-default-export
			// - no-unused-vars
			// - prefer-const
			rules: {
				"import/no-extraneous-dependencies": [
					"error",
					{ devDependencies: true },
				],
				"import/no-mutable-exports": 0,
				"import/prefer-default-export": 0,
				"no-console": 0,
				"no-unused-vars": 0,
				"prefer-const": 0,
			},
		},
	],
};
