<svelte:head>
	<title>crash report #{report.id}</title>
</svelte:head>

<h1>
	<a href="/">crash report</a>
	#{report.id}
</h1>

<div id="timestamps">
	<div>
		<svg width="24" height="24" viewBox="0 0 24 24">
			<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
			<path d="M0 0h24v24H0z" fill="none" />
			<path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
		</svg>
		<span>{new Date(report.created_at).toLocaleString()}</span>
	</div>

	<div>
		<svg width="24" height="24" viewBox="0 0 24 24">
			<defs><path id="a" d="M0 0h24v24H0V0z" /></defs>
			<clipPath id="b"><use xlink:href="#a" overflow="visible" /></clipPath>
			<path clip-path="url(#b)" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
		</svg>
		<span>{report.open ? "—" : new Date(report.closed_at).toLocaleString()}</span>
	</div>

	<div>
		<svg width="24" height="24">
			<path d="M0 0h24v24H0z" fill="none" />
			<path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 0 0 7.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
		</svg>
		<span>{lifetime()}</span>
	</div>
</div>

<div id="buttons">
	<button
		class:active={details_visible}
		on:click={toggle_details_visible}
		type="button"
	>
		details
	</button>

	<a
		class:active={stack_trace_visible}
		on:click={toggle_stack_trace_visible}
		href="/s/{report.id}"
		role="button"
	>
		stack trace
	</a>

	<a href="/d/{report.id}" role="button">
		download minidump
	</a>

	<button class:open={report.open} on:click={toggle_report_open} type="button">
		{report.open ? "close" : "open" }
	</button>

	<button class="delete" on:click={delete_report} type="button">
		delete
	</button>
</div>

{#if details_visible}
<h2>details</h2>
<pre>{JSON.stringify(report.body, null, 2)}</pre>
{/if} {#if stack_trace_visible}
<h2>stack trace</h2>
<pre>{stack_trace}</pre>
{/if}

<script>
import pretty_ms from "pretty-ms";

export let report = {};

let details_visible = true;
let stack_trace_visible = false;
let lifetime = "";
let stack_trace = "";

$: lifetime = () => {
	const closed = new Date(report.closed_at || Date.now());
	const created = new Date(report.created_at);

	if (typeof pretty_ms !== "function") return "—";
	return pretty_ms(closed - created, { compact: true });
};

async function delete_report() {
	try {
		await fetch(`/r/${report.id}`, { method: "DELETE" });
		document.location.pathname = "/";
	} catch (error) {
		throw error;
	}
}

function toggle_details_visible() {
	details_visible = !details_visible;
}

async function toggle_report_open() {
	// Make it instant!
	report.open = !report.open;

	try {
		const response = await fetch(`/r/${report.id}`, { method: "PATCH" });
		report = await response.json();
	} catch (error) {
		throw error;
	}
}

async function toggle_stack_trace_visible(event) {
	event.preventDefault();

	if (stack_trace) {
		stack_trace_visible = !stack_trace_visible;
		return null;
	}

	try {
		const response = await fetch(`/s/${report.id}`);
		const data = await response.json();

		// eslint-disable-next-line prefer-destructuring
		stack_trace = data.stack_trace;
		stack_trace_visible = !stack_trace_visible;

		return stack_trace;
	} catch (error) {
		throw error;
	}
}
</script>

<style>
h1,
h2,
pre,
#timestamps,
#buttons {
	margin: 1rem 1.5rem;
}

h1,
h2 {
	font-family: monospace;
	font-weight: 400;
}

h1 a {
	color: black;
	font-family: sans-serif;
	font-weight: 900;
}

#timestamps div {
	display: flex;
	align-items: center;
	margin: 0.5rem 0;
}

#timestamps svg {
	margin-right: 0.5rem;
}

#buttons {
	display: flex;
	flex-wrap: wrap;
}

button,
[role="button"] {
	display: block;
	margin-right: 0.5rem;
	margin-bottom: 0.5rem;
	padding: 1rem;
	background-color: gainsboro;
}

button:last-child,
[role="button"]:last-child {
	margin-right: 0;
}

.active {
	color: white;
	background-color: rebeccapurple;
}

.open {
	color: white;
	background-color: darkgreen;
}

.delete {
	color: white;
	background-color: darkred;
}

pre {
	padding: 1.5rem;
	margin: 1rem 0;
	overflow: auto;
	font-size: 1.25rem;
	background-color: ghostwhite;
	border-top: 1px solid lightgray;
	border-bottom: 1px solid lightgray;
}
</style>
