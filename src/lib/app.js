
export async function setupApp(store) {
	// get the current year
	const calendar = await store.find({
		selector: {
			_id: { $gt: 'calendar', $lt: 'calendar\uffff' },
			year: now.getFullYear(),
		},
		limit: 1
	});

	if (!calendar) {
		await createCalendar(store, now.getFullYear());
	}

}

/**
 * Perform initial setup, should only be called
 * when it is necessary to create a new calendar
 * @return {Promise} [description]
 */
export async function createCalendar(store, year) {
	console.log('creating new calendar for', year);
	year = year || new Date().getFullYear();

	// create a new calendary for the year
	const calendar = store.createDoc('calendar', {
		year,
		months: []
	});

	let allDays = [];
	const months = Array.from({length: 12}, (v, i) => store.createDoc('month', {
		title: new Date(calendar.year, i, 1).toLocaleString('en-us', { month: 'long' }),
		index: i,
		days: [],
		calendar: calendar._id
	}))
	.map(month => {
		const numDays = this.daysInMonth(calendar.year, month.index);
		const days = Array.from({length: numDays}, (v, i) => store.createDoc('day', {
			weekday: this.weekday(calendar.year, month.index, i + 1),
			index: i + 1,
			month: month._id
		}));
		month.days = days.map(d => d._id);
		allDays = allDays.concat(days);
		return month;
	});

	calendar.months = months.map(m => m._id);

	await store.insertDoc(calendar);
	await store.insertDocs(months);
	await store.insertDocs(allDays);

	const calendarDoc = await store.findRecord(calendar._id);
	const monthDocs = await store.findRecords(calendarDoc.months);
}

function daysInMonth(year, month) {
	if (!year) year = new Date().getFullYear();
	if (isNaN(parseInt(month))) month = new Date().getMonth();
	const nextMonth = month + 1;

	return new Date(year, nextMonth, 0).getDate();
}

function weekday(year, month, day) {
	if (!year) year = new Date().getFullYear();
	if (isNaN(parseInt(month))) month = new Date().getMonth();

	const d = new Date(year, month, day).getDay();
	return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d];
}
