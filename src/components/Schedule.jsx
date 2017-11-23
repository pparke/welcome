import React from 'react';
import store from '../lib/Store';

// assets
import '../scss/schedule.scss';

export default class Schedule extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			year: props.year,
			month: props.month,
			day: props.day
		};

		this.setup = this.setup.bind(this);
		this.renderDays = this.renderDays.bind(this);
		this.daysInMonth = this.daysInMonth.bind(this);
		this.weekday = this.weekday.bind(this);

		this.setup();
	}

	async setup() {
		const year = new Date().getFullYear();
		let calendar = await store.findFirst('calendar');

		// if there isn't already a calendar, create one
		// for the current year
		if (!calendar) {
			const newCalendar = await store.createRecord('calendar', {
				year: new Date().getFullYear(),
				months: []
			});
			calendar = await store.findRecord(newCalendar.id);
			const monthIds = [];
			for (let i = 0; i < 12; i++) {
				const newMonth = await store.createRecord('month', {
					title: new Date(calendar.year, i, 1).toLocaleString('en-us', { month: 'long' }),
					index: i,
					days: []
				});
				monthIds.push(newMonth.id);
			}
			calendar.months = monthIds;
			await store.updateRecord(newCalendar.id, calendar);
		}

		const months = await store.findRecords(calendar.months);
		console.log(calendar, months);
	}

	daysInMonth(year, nextMonth) {
		if (!year) year = new Date().getFullYear();
		if (isNaN(parseInt(nextMonth))) nextMonth = new Date().getMonth() + 1;

		return new Date(year, nextMonth, 0).getDate();
	}

	weekday(year, month, day) {
		if (!year) year = new Date().getFullYear();
		if (isNaN(parseInt(month))) month = new Date().getMonth();

		const d = new Date(year, month, day).getDay();
		return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d];
	}

	renderDays() {
		const nDays = this.daysInMonth();
		const offset = new Date(new Date().setDate(1)).getDay();
		let counter = 0;
		return new Array(35).fill(null).map(() => {
			const id = `day-${counter++}`;
			const day = (counter > offset && counter <= nDays + offset) ? counter - offset : '';
			return <div id={id} key={id} className='day'>{ day }</div>;
		});
	}
	render() {
		const days = this.renderDays();
		return (
			<div className='schedule'>
				<div className='header'>
					<div className='month'>November</div>
					<div className='year'>2017</div>
				</div>
				<div className='calendar'>
					{ days }
				</div>
			</div>
		);
	}
}
