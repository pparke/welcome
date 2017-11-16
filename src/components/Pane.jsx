import React from 'react';
import '../scss/pane.scss';

const Pane = ({ theme, title, children, contentLayout }) => {
	const className = `pane ${theme || ''}`;
	const contentClassName = `content ${contentLayout || ''}`;
	return (
		<div className={className}>
			<div className='top-bar'>
				<div className='control'></div>
				<div className='title'>{ title }</div>
			</div>
			<div className={contentClassName}>
				{ children }
			</div>
		</div>
	);
};

export default Pane;
