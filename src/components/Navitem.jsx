import React from 'react';
import '../scss/navitem.scss';
import { Link } from 'react-router-dom';

const Navitem = ({ text, link }) => (
	<li className='navitem'>
		<Link to={`/${link}`}>
			{ text }
		</Link>
	</li>
);

export default Navitem;
