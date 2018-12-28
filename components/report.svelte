<svelte:head>
	<title>Crash report #{report.id}</title>
</svelte:head>

<script>
import AppBar from "./app-bar.svelte";
import prettyMs from "pretty-ms";

export let report = {};

let detailsVisible = false;
let stackTraceVisible = false;

const lifetime = () => {
	const closed = new Date(report.closed_at || Date.now());
	const created = new Date(report.created_at);
	const options = { secDecimalDigits: 0 };
	return prettyMs(closed - created, options);
};

const toggleDetailsVisibility = () => {
	detailsVisible = !detailsVisible;
};

const getStackTrace = async () => {
	if (report.stackTrace) {
		stackTraceVisible = !stackTraceVisible;
		return null;
	}

	try {
		const response = await fetch(`/reports/${report.id}/stack`);
		const data = await response.json();
		const { stack_trace: stackTrace } = data;
		report.stackTrace = stackTrace;
		stackTraceVisible = !stackTraceVisible;
		return report;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const toggleReportStatus = async () => {
	try {
		const options = { method: "PATCH" };
		const response = await fetch(`/reports/${report.id}`, options);
		const data = await response.json();

		if (report.stackTrace) {
			const { stackTrace } = report;
			data.stackTrace = stackTrace;
		}

		report = data;
		return report;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const deleteReport = async () => {
	try {
		const options = { method: "DELETE" };
		const response = await fetch(`/reports/${report.id}`, options);

		document.location.pathname = "/";
	} catch (error) {
		console.error(error);
		throw error;
	}
};
</script>

<AppBar>
	<h1 slot="title"><a href="/">Crash reports</a></h1>
	<div slot="extra"><span>#{report.id}</span></div>
</AppBar>

<main>
	<div class="wrap">
		<div class="timestamp">
			<img alt="created at" src="/baseline-access_time-24px.svg" />
			<span>{new Date(report.created_at)}</span>
		</div>

		<div class="timestamp">
			<img alt="created at" src="/baseline-watch_later-24px.svg" />
			<span>
				{#if report.open} — {:else} {new Date(report.closed_at)} {/if}
			</span>
		</div>

		<div class="timestamp">
			<img alt="created at" src="/baseline-timer-24px.svg" />
			<span>{lifetime()}</span>
		</div>

		<div id="views">
			<button
				class:visible="{detailsVisible}"
				type="button"
				on:click="{toggleDetailsVisibility}"
			>
				View report details
			</button>

			<button
				class:visible="{stackTraceVisible}"
				type="button"
				on:click="{getStackTrace}"
			>
				View stack trace
			</button>

			<a href="/reports/{report.id}/dump" role="button">
				Download minidump
			</a>
		</div>

		<div id="actions">
			<button
				class:closed="{!report.open}"
				on:click="{toggleReportStatus}"
				type="button"
			>
				{report.open ? "Close" : "Reopen" } report
			</button>

			<button class="delete" on:click="{deleteReport}" type="button">
				Delete report
			</button>
		</div>

		{#if detailsVisible}
		<pre>{JSON.stringify(report.body, null, 2)}</pre>
		{/if}

		{#if stackTraceVisible}
		<pre>{report.stackTrace}</pre>
		{/if}
	</div>
</main>

<style>
main > div {
	padding-top: 2rem;
	padding-left: 2rem;
}

button,
[role="button"] {
	display: block;
	padding: 1rem;
	width: 100%;
	font-family: sans-serif;
	font-size: 1.125em;
	text-align: left;
	text-decoration: none;
	color: black;
	background-color: gainsboro;
	border: 0;
	cursor: default;
}

button:not(:last-child),
[role="button"]:not(:last-child) {
	margin-right: 0.25rem;
}

pre {
	padding: 1rem;
	margin: 2rem 0;
	overflow: auto;
	font-size: 1.2307692307692308rem; /* 16px */
	background-color: whitesmoke;
	border: 1px solid lightgray;
	border-radius: 0.125rem;
}

.timestamp {
	display: flex;
	align-items: center;
	margin: 0.5rem 0;
	font-size: 0.875em;
}

.timestamp span {
	margin-left: 0.5rem;
}

.closed {
	color: black;
	background-color: limegreen;
}

.visible {
	color: white;
	background-color: royalblue;
}

.delete {
	color: white;
	background-color: crimson;
}

#actions,
#views {
	display: flex;
	margin-bottom: 0.25rem;
}

#views {
	margin-top: 2rem;
}
</style>
