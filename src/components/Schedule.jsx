import React from 'react';
import store from '../lib/Store';

// assets
import '../scss/schedule.scss';

class Schedule extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			calendar: props.calendar,
			month: props.month,
			day: props.day
		};

		this.renderDays = this.renderDays.bind(this);
		this.renderWeekDays = this.renderWeekDays.bind(this);
	}

	renderDays() {
		let { days, currentDay } = this.props;
		const offset = new Date(new Date().setDate(1)).getDay();
		const padStart = new Array(offset).fill(null);
		const padEnd = new Array(35 - (offset + days.length)).fill(null);
		days = [].concat(padStart, days, padEnd);

		return days.map((day, i) =>  {
			const key = `day-${i}`;
			let className = 'day';
			if (day) {
				className += day._id === currentDay._id ? ' today' : '';
				return <div id={day._id} key={key} className={className}>
					<div className='number'>{ day.index }</div>
				</div>;
			}
			className += ' outside';
			return <div key={key} className={className}></div>;
		});
	}

	renderWeekDays() {
		return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
			<div className='weekday' key={day}>{day}</div>
		));
	}

	render() {
		const { currentMonth, calendar } = this.props;
		const days = this.renderDays();
		const weekdays = this.renderWeekDays();
		return (
			<div className='schedule'>
				<div className='header'>
					<div className='month'>{currentMonth.title}</div>
					<div className='year'>{calendar.year}</div>
				</div>
				<div className='weekday-names'>
					{weekdays}
				</div>
				<div className='calendar'>
					{ days }
				</div>
			</div>
		);
	}
}

const mapStore = async store => {
	const state = store.state;
	let months;
	let currentMonth;
	let days;
	let currentDay;

	const now = new Date();

	store.db.createIndex({
	  index: {fields: ['year']}
	});

	// get the current year
	const calendar = await store.find({
		selector: {
			_id: { $gt: 'calendar', $lt: 'calendar\uffff' },
			year: now.getFullYear(),
		},
		limit: 1
	});
	console.log('calendar', calendar);
	if (calendar) {
		// get the months in the calendar year
		months = await store.findRecords(calendar.months);
		console.log('months', months)
		const monthIndex = now.getMonth();
		currentMonth = months.find(month => month.index === monthIndex);
		console.log('currentMonth', currentMonth);
		// get the days in the current month
		days = await store.findRecords(currentMonth.days);
		console.log('days', days)
		const dayIndex = now.getDate();
		currentDay = days.find(day => day.index === dayIndex);
		console.log('currentDay', currentDay);
	}

	return {
		calendar,
		months,
		currentMonth,
		days,
		currentDay
	};
};

export default store.connect(mapStore)(Schedule);
