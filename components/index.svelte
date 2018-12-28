<svelte:head>
	<title>{title}</title>
</svelte:head>

<script>
import AppBar from "./app-bar.svelte";
import prettyMs from "pretty-ms";

export let applications = [];
export let reports = [];

const title = "Crash reports";

let application = "";
let closed = true;

try {
	let { application: a, closed: b } = localStorage;

	a = JSON.parse(a);
	b = JSON.parse(b);

	if (a.value) {
		const { value: previousApplication } = a;
		application = previousApplication;
	}

	if (b.value !== undefined && (b.value === true || b.value === false)) {
		const { value: previousClosed } = b;
		closed = previousClosed;
	}
} catch (error) {
	console.warn(error);
}

const selected = () =>
	reports
		.filter(x => {
			if (!application) {
				return x;
			}

			// eslint-disable-next-line no-underscore-dangle
			return x.body._productName === application;
		})
		.filter(x => {
			if (closed) {
				return x;
			}

			return x.open;
		});

const created = at => {
	const options = { compact: true };
	const start = new Date(at);
	const current = new Date(Date.now());
	const duration = prettyMs(current - start, options).replace("~", "");
	return `created ${duration} ago`;
};

const toggleClosed = () => {
	closed = !closed;
	localStorage.closed = JSON.stringify({ value: closed });
};

const changeApplication = () => {
	localStorage.application = JSON.stringify({ value: application });
};
</script>

<AppBar>
	<h1 slot="title">{title}</h1>
	<div slot="extra">
		<label on:click="{toggleClosed}">
			{#if closed}
			<img alt="show closed reports" src="/baseline-check_box-24px.svg" />
			{:else}
			<img
				alt="hide closed reports"
				src="/baseline-check_box_outline_blank-24px.svg"
			/>
			{/if}
			<span>Show closed</span>
		</label>

		{#if applications.length > 0}
		<label>
			<span class="sr-only">Show application</span>
			<select bind:value="{application}" on:change="{changeApplication}">
				<option value="">Show all</option>
				{#each applications as application}
				<option value="{application}">{application}</option>
				{/each}
			</select>
		</label>
		{/if}
	</div>
</AppBar>

<main>
	<ul class="wrap">
		{#each selected() as report (report.id)}
		<li class:closed="{!report.open}">
			<a href="/reports/{report.id}">
				<div>
					<div class="id"><span>#</span>{report.id}</div>
					<div class="created-at">{created(report.created_at)}</div>
				</div>
				<div class="name">{report.body._productName}</div>
				<div class="version">{report.body._version}</div>
				<div class="platform">{report.body.platform}</div>
				<div class="process-type">{report.body.process_type}</div>
			</a>
		</li>
		{/each}
	</ul>
</main>

<style>
ul {
	list-style-type: none;
}

li:not(:last-child) {
	border-bottom: 1px solid gainsboro;
}

li a {
	display: flex;
	align-items: center;
	padding: 1.5rem 2rem;
	text-decoration: none;
	color: black;
}

li a > div {
	width: 20%;
}

li a > div:not(:last-child) {
	margin-right: 2rem;
}

li a .id {
	font-family: monospace;
	font-size: 1.6153846153846154rem;
	font-weight: 900;
}

li a .id span {
	font-weight: 300;
	color: dimgray;
}

li a .created-at {
	font-size: 0.875rem;
	color: dimgray;
}

li a .name,
li a .version,
li a .platform,
li a .process-type {
	text-transform: lowercase;
}

.closed a {
	color: gray;
	background-color: whitesmoke;
}

.closed a .id {
	font-weight: 400;
}

label {
	display: flex;
	align-items: center;
	text-transform: lowercase;
}

label:not(:last-child) {
	margin-right: 2rem;
}

label img {
	margin-right: 0.25rem;
}
</style>
