import React from 'react';
import store from '../lib/Store';

// components
import Pane from './Pane';
import Stats from './Stats';
import Todo from './Todo';

// assets
import '../scss/dashboard.scss';


class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.renderLists = this.renderLists.bind(this);
		this.addList = this.addList.bind(this);
	}

	componentDidMount() {
	}

	componentWillReceiveProps(next) {
	}

	renderLists() {
		return this.props.lists.map(list => {
			return <Todo title={list.title} key={list._id} listId={list._id} />
		});
	}

	async addList() {
		const list = await store.createRecord('list', {
			title: 'Todo',
			todos: []
		});
	}

	render() {
		const lists = this.renderLists();
		return (
			<div className='dashboard'>
				<div className='add-list' onClick={this.addList}>
					<i className="fa fa-plus" aria-hidden="true"></i> Add List
				</div>
				<div className='column-container'>
					{lists}
				</div>
			</div>
		);
	}
}

const mapStore = async store => {
	const state = store.state;

	const lists = await store.findAll('list');

	// get all the sectors in the current system
	return {
		user: state.user,
		lists
	};
};

export default store.connect(mapStore)(Dashboard);
