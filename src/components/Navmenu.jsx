import React from 'react';
import Navitem from './Navitem';
import '../scss/navmenu.scss';
import FontAwesome from 'react-fontawesome';

export default class Navmenu extends React.PureComponent {
	constructor(props) {
		super(props);

		this.renderMenu = this.renderMenu.bind(this);
		this.renderItem = this.renderItem.bind(this);
	}

	renderMenu() {
		if (!this.props.open) {
			return <div className='title'>{ this.props.title }</div>;
		}
		return (
			<ul>
				{ this.props.items.map(this.renderItem) }
			</ul>
		);
	}

	renderItem(item, i) {
		return <Navitem
				key={ i.toString() }
				text={ item.text }
				link={ item.link }
				icon={ item.icon }
				onClick={ this.props.menuAction.bind(this, item.action) }/>;
	}

	render() {
		return (
			<div className='navmenu'>
				<div className='menu-toggle' onClick={ this.props.toggle }>
					<FontAwesome name='navicon' size='2x' />
				</div>
				{ this.renderMenu() }
			</div>
		);
	}
}
