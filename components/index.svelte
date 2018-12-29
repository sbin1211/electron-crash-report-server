<svelte:head>
	<title>crash reports</title>
</svelte:head>

<div id="filters">
	<label on:click={toggle_closed_visible}>
		{#if closed_visible}
		<svg width="24" height="24">
			<path d="M0 0h24v24H0z" fill="none" />
			<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#fff" />
		</svg>
		{:else}
		<svg width="24" height="24">
			<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#fff" />
			<path d="M0 0h24v24H0z" fill="none" />
		</svg>
		{/if}
		<span>show closed?</span>
	</label>

	{#if applications.length > 0}
	<label>
		<span class="sr-only">select application</span>
		<select bind:value={application} on:change={change_application}>
			<option value="">show all</option>
			{#each applications as application}
			<option value={application}>{application}</option>
			{/each}
		</select>
	</label>
	{/if}
</div>

<ul>
	{#each selected() as report}
	<li class:open={report.open}>
		<a href="/r/{report.id}">
			<div>
				<div class="id">#<b>{report.id}</b></div>
				<div class="age">{created(report.created_at)}</div>
			</div>

			{#if report.body}
			{#if report.body._productName}
			<div>{report.body._productName}</div>
			{/if}

			{#if report.body._version}
			<div>{report.body._version}</div>
			{/if}

			{#if report.body.platform}
			<div>{report.body.platform}</div>
			{/if}

			{#if report.body.process_type}
			<div>{report.body.process_type}</div>
			{/if}
			{/if}
		</a>
	</li>
	{/each}
</ul>

<script>
import pretty_ms from "pretty-ms";

export let applications = [];
export let reports = [];

let application = "";
let closed_visible = true;
let selected = [];

function has_localStorage() {
	try {
		localStorage.setItem("$$", "$$");
		localStorage.removeItem("$$");
		return true;
	} catch (error) {
		return false;
	}
}

try {
	if (has_localStorage()) {
		let {
			application: _application,
			closed_visible: _closed_visible
		} = localStorage;

		if (_application) application = _application;
		if (_closed_visible) closed_visible = JSON.parse(_closed_visible);
	}
} catch (error) {
	console.warn(error);
}

$: selected = () => {
	return reports.filter(x => {
		if (application) return x.body._productName === application;
		return x;
	}).filter(x => {
		if (closed_visible) return x;
		return x.open;
	});
};

function change_application() {
	if (has_localStorage()) localStorage.application = application;
}

function created(at) {
	if (typeof pretty_ms !== "function") return "—";

	const now = new Date(Date.now());
	const start = new Date(at);
	const time = pretty_ms(now - start, { compact: true });

	return `${time} ago`;
};

function toggle_closed_visible() {
	closed_visible = !closed_visible
	if (has_localStorage()) localStorage.closed_visible = closed_visible;
}
</script>

<style>
#filters {
	display: flex;
	align-items: center;
	color: white;
	background-color: black;
}

label {
	display: flex;
	align-items: center;
	padding: 1rem 1.5rem;
}

label:first-child {
	margin-right: 2rem;
}

label svg {
	margin-right: 0.5rem;
}

select {
	font-size: 1rem;
}

ul {
	list-style-type: none;
}

li:not(:last-child) {
	border-bottom: 1px solid gainsboro;
}

a {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 1.5rem;
	text-decoration: none;
	color: dimgray;
	background-color: ghostwhite;
	/* background-color: whitesmoke; */
}

a > div {
	width: 15%;
}

a > div:first-child {
	width: 40%;
}

.id {
	font-family: monospace;
	font-size: calc(18rem/13);
	font-weight: 300;
	color: dimgray;
}

.id b {
	font-weight: 400;
}

.age {
	font-size: 0.875rem;
	color: dimgray;
}

.open a,
.open .id {
	color: black;
	background-color: white;
}

.open .id b {
	font-weight: 900;
}
</style>
