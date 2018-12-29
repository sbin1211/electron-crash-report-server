require("svelte/register")({ extensions: [".svelte"] });

const { basename, resolve } = require("path");

function header(component) {
	return `
<!doctype html>
<html lang="en">
  ${component.head}
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <link rel="icon" href="/favicon.png" />
  <style>
	html { box-sizing: border-box }
	body { line-height: 1.5 }
	button, [role="button"] { all: unset; cursor: default }
	svelte-view { display: block }
	*, *::before, *::after { box-sizing: inherit; margin: 0; padding: 0 }
	.sr-only {
	  clip: rect(1px, 1px, 1px, 1px);
	  height: 1px;
	  width: 1px;
	  overflow: hidden;
	  position: absolute !important
	}
	${component.css.code}
  </style>
`;
}

function src(path) {
	return `/${basename(path, ".svelte")}.js`;
}

module.exports = {
	module: {
		compile: (template, options) => {
			const path = resolve(options.filename);

			return context => {
				try {
					// eslint-disable-next-line global-require, import/no-dynamic-require
					const { default: view } = require(path);
					const component = view.render(context);

					const script = `
<script type="module">
import Component from "${src(path)}";
window.COMPONENT = new Component({
props: ${JSON.stringify(context)},
hydrate: true,
target: document.querySelector("svelte-view"),
});
</script>`;

					return `
${header(component)}
<svelte-view>${component.html}</svelte-view>
${script}
`;
				} catch (error) {
					throw error;
				}
			};
		},
	},
};
