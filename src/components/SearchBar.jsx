import React from 'react';
import store from '../lib/Store';
import config from '../../config';
// components

// assets
import '../scss/search-bar.scss';


class SearchBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
			suggested: 'Search by title'
		};

		this.searchInput = null;
		this.minChars = 3;

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		console.log('value is', event.target.value)
		this.setState({
			title: event.target.value
		});
	}

	async handleSubmit(event) {
		event.preventDefault();

		if (this.state.title.length < this.minChars) {
			return;
		}

		// find the notes whose title matches the search
		const results = await store.search(this.state.title, ['title', 'content']);
		const notes = results.docs;

		if (notes.length === 0) return;

		this.setState({
			suggested: notes[0].title
		});

		this.props.handleResults(notes);
	}

	render() {
		return (
			<div className='search-bar'>
				<form onSubmit={this.handleSubmit}>
					<input
						className='search-title'
						type="text"
						name="search"
						onChange={this.handleChange}
						ref={node => this.searchInput = node}
						placeholder={this.state.suggested}
					/>
				</form>
			</div>
		)
	}
}

const mapStore = async (store, props) => {
	const { handleResults } = props;
	store.db.createIndex({
		index: {fields: ['title']}
	});
	return {
		handleResults
	};
};

export default store.connect(mapStore)(SearchBar);
