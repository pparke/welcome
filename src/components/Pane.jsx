import React from 'react';
import '../scss/pane.scss';

const Pane = ({ theme, title, children, contentLayout, close }) => {
	const className = `pane ${theme || ''}`;
	const contentClassName = `content ${contentLayout || ''}`;
	return (
		<div className={className}>
			<div className='top-bar'>
				<div className='title'>{ title }</div>
				<div className='control'>
					<div className='todo-remove' onClick={close}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</div>
				</div>
			</div>
			<div className={contentClassName}>
				{ children }
			</div>
		</div>
	);
};

export default Pane;
