import React from 'react';
import store from '../lib/Store';
import config from '../../config';
import { Redirect } from 'react-router'
// components
import Pane from './Pane';

// assets
import '../scss/note.scss';


class NoteContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
			content: ''
		};

		this.titleInput = null;
		this.contentInput = null;
	}

	handleChange(event) {
		const { name, value } = event.target;
		console.log('setting', name, 'to', value);
		this.setState({
			[name]: value
		});
	}

	async handleSubmit(event) {
		event.preventDefault();

		let { note, dayId } = this.props;

		// if the note doesn't exist, create it
		if (!note) {
			note = await store.createDoc('note', {
				day_id: dayId,
				tags: []
			});
			const result = await store.insertDoc(note);
			note = await store.findRecord(note._id);
		}

		note.title = this.state.title;
		note.content = this.state.content;

		const result = await store.updateRecord(note._id, note);

		this.input.value = '';
	}

	async handleRemove(note) {
		const id = note._id;
		const result = await store.removeRecord(id);
		console.log('remove note', result);
	}

	render() {
		const { note } = this.props;
		return (
			<div className='note-container'>
				<Pane
					theme={'clear'}
					close={this.handleRemove.bind(this, note)}
					contentLayout={'column'}
				>
					<form onSubmit={this.handleSubmit}>
						<input
							className='note-title'
							type="text" name="title"
							onChange={this.handleChange}
							ref={node => this.titleInput = node}
							value={note.title}
						/>
						<textarea
							className='note-content'
							name="content"
							onChange={this.handleChange}
							ref={node => this.contentInput = node}
							value={note.content}
						/>
					</form>
				</Pane>
			</div>
		);
	}
}

const mapStore = async (store, props) => {
	const note = await store.findRecord(props.noteId);
	console.log('found note', note)

	return {
		note
	}
};

export default store.connect(mapStore)(NoteContainer);
