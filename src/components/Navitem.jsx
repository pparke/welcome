import React from 'react';
import '../scss/navitem.scss';
import { Link } from 'react-router-dom';

const Navitem = ({ text, link, icon }) => (
	<li className='navitem'>
		<Link to={`/${link}`}>
			<i className={`fa fa-${icon}`} aria-hidden="true"></i>
			<span className='sr-only'>{ text }</span>
		</Link>
	</li>
);

export default Navitem;
