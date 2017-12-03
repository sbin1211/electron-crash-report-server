/* global preact, PropTypes */
export default function FilterApplication (props) {
	if (props.applications.length === 1) return null

	return preact.h(
		'div',
		null,
		preact.h(
			'select',
			{
				onChange: props.onChange,
				value: props.filter,
			},
			preact.h('option', {value: ''}, 'Show all'),
			compact(props.applications).map((value, key) =>
				preact.h('option', {key, value}, value)
			)
		)
	)
}

FilterApplication.propTypes = {
	applications: PropTypes.array,
	filter: PropTypes.string,
	onChange: PropTypes.func,
}

function compact (array) {
	return array
		.filter(i => i != null)
		.filter(i => i.toString().trim().length)
		.filter(i => !!i)
}
