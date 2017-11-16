import React from 'react';

import '../scss/stats.scss';

class Stats extends React.Component {

	renderItems(items) {
		return items.map((item, i) => {
			return <li key={i}>{item}</li>
		});
	}

	render() {
		const { header, items } = this.props;
		return (
			<div className='stats'>
				<h3 className='header'>{header}</h3>
				<ul>
					{ this.renderItems(items) }
				</ul>
			</div>
		);
	}
}

export default Stats;
