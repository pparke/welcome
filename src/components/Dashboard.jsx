import React from 'react';
import store from '../lib/Store';

// components
import Pane from './Pane';
import Stats from './Stats';
import Todo from './Todo';
import Note from './Note';
import SearchBar from './SearchBar';

// assets
import '../scss/dashboard.scss';


class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.renderLists = this.renderLists.bind(this);
		this.renderNotes = this.renderNotes.bind(this);
		this.addList = this.addList.bind(this);
		this.setNotes = this.setNotes.bind(this);
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

	renderNotes(notes) {
		if (!notes) return;
		return notes.map(note => {
			return <Note title={note.title} content={note.content} key={note._id} noteId={note._id} />
		});
	}

	setNotes(notes) {
		this.setState({
			matchingNotes: notes
		});
	}

	async addList() {
		const list = await store.createRecord('list', {
			title: 'Todo',
			todos: []
		});
	}

	async clearAll() {
		await store.db.destroy();
		store.setupDB();
	}

	render() {
		const lists = this.renderLists();
		const notes = this.renderNotes(this.props.notes);
		const matchingNotes = this.renderNotes(this.state.matchingNotes);
		return (
			<div className='dashboard'>
				<div className='btn add-list' onClick={this.addList}>
					<i className='fa fa-plus' aria-hidden='true'></i> Add List
				</div>
				<div className='btn clear-all' onClick={this.clearAll}>
					<i className='fa fa-trash-o' aria-hidden='true'></i> Clear All
				</div>
				<SearchBar handleResults={this.setNotes}/>
				<div className='column-container'>
					{ matchingNotes }
				</div>
				<div className='column-container'>
					{ notes }
				</div>
				<div className='column-container'>
					{ lists }
				</div>
			</div>
		);
	}
}

const mapStore = async store => {
	const state = store.state;

	const lists = await store.findAll('list');
	const notes = await store.findAll('notes');

	return {
		user: state.user,
		lists,
		notes
	};
};

export default store.connect(mapStore)(Dashboard);
