/* eslint-disable fp/no-let */
/* eslint-disable indent */

/** Returns a string date represents a given date related to the current date */
export function dateToRelativeTime(date: Date): string {
	const delta = Math.round((+new Date() - (+date)) / 1000)
	const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	const minute = 60
	const hour = minute * 60
	const day = hour * 24
	const month = day * 30
	const year = month * 12

	switch (true) {
		case (delta < 30):
			return 'a few seconds ago'
		case (delta < minute):
			return delta + ' seconds ago'
		case (delta < 2 * minute):
			return 'a minute ago'
		case (delta < hour):
			return Math.floor(delta / minute) + ' minutes ago'
		case (Math.floor(delta / hour) == 1):
			return '1 hour ago'
		case (delta < day):
			return Math.floor(delta / hour) + ' hours ago'
		case (delta < day * 2):
			return 'yesterday'
		case (delta < day * 7):
			return `last ${weekDays[date.getDay()]}`
		case (delta < day * 30):
			return Math.floor(delta / day) + ' days ago'
		case (delta < month * 2):
			return '1 month ago'
		case (delta < month * 12):
			return Math.floor(delta / month) + ' months ago'
		case (delta < year * 2):
			return `1 year ago`
		default:
			return Math.floor(delta / year) + ' years ago'
	}
}

/** Returns a string representing the date object formated as "YYMMDD hh:mm:ss" */
export function dateToYMDString(date: Date): string {
	const yyyy = date.getFullYear().toString()
	let dd = date.getDate().toString()
	let mm = (date.getMonth() + 1).toString()

	if (dd.length === 1)
		dd = "0" + dd

	if (mm.length === 1)
		mm = "0" + mm
	const currentDate = yyyy + "-" + mm + "-" + dd

	let hours = date.getHours().toString()
	let minutes = date.getMinutes().toString()
	let seconds = date.getSeconds().toString()

	if (hours.length === 1)
		hours = "0" + hours

	if (minutes.length === 1)
		minutes = "0" + minutes

	if (seconds.length === 1)
		seconds = "0" + seconds

	return currentDate + " " + hours + ":" + minutes + ":" + seconds
}