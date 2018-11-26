<header>
	<div class="wrap">
		<slot name="title"></slot>
		<slot name="extra"></slot>
	</div>
</header>

<style>
header {
	color: ghostwhite;
	background-color: black;
	/* border-bottom: 1px solid gainsboro; */
}

header > div {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 2rem;
}

:global(header) > div > div {
	display: flex;
	align-items: center;
}

:global(header) h1 {
	/* font-family: monospace; */
	font-size: 1.8461538461538463rem; /* 24px */
	font-size: 1.6153846153846154rem; /* 21px */
	font-size: 1.5rem;
	font-weight: 900;
	text-transform: lowercase;
	/* color: gray; */
}

:global(header) h1 a {
	text-decoration: none;
	color: ghostwhite;
	/* color: gray; */
}

:global(header) div > span {
	font-family: monospace;
	font-size: 1.6153846153846154rem; /* 21px */
}
</style>