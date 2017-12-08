import React from 'react';
import store from '../lib/Store';
import config from '../../config';
import { Redirect } from 'react-router'
// components
import Pane from './Pane';

// assets
import '../scss/todo.scss';


class TodoContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: ''
		};

		this.input = null;

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
		this.handleListRemove = this.handleListRemove.bind(this);
	}

	componentWillReceiveProps(next) {
	}

	handleChange(event) {
		this.setState({
			title: event.target.value
		});
	}

	async handleSubmit(event) {
		event.preventDefault();

		const { listId } = this.props;
		try {
			const todo = store.createDoc('todo', {
				title: this.state.title,
				complete: false,
				completed_on: null,
				todo_type: 'checklist',
				list_id: listId
			});
			const todoResult = await store.insertDoc(todo);
			console.log('created todo', todoResult, todo)
			const list = await store.findRecord(listId);
			console.log('found list', list)
			list.todos = [].concat(list.todos, todo._id);
			const result = await store.updateRecord(list._id, list);
			console.log('new todo is', todoResult, 'updated list is', result);

			this.input.value = '';
		}
		catch (err) {
			console.log(err);
		}
	}

	async handleComplete(todo) {
		const id = todo._id;
		const result = await store.updateRecord(id, {
			complete: true,
			completed_on: Date.now()
		});
	}

	async handleIncomplete(todo) {
		const id = todo._id;
		const result = await store.updateRecord(id, {
			complete: false,
			completed_on: null
		});
	}

	async handleRemove(todo) {
		const id = todo._id;
		const result = await store.removeRecord(id);
		console.log('remove todo', result);
	}

	async handleListRemove() {
		const { listId } = this.props;
		const list = await store.findRecord(listId);
		const todoResult = await store.removeRecords(list.todos.concat(listId))
		//const result = await store.removeRecord(listId);
	}

	render() {
		return (
			<div className='todo-container'>
				<Pane theme={'clear'} title={this.props.title} close={this.handleListRemove} contentLayout={'column'}>
					<form onSubmit={this.handleSubmit}>
						<input className='todo-input' type="text" name="newTodo" onChange={this.handleChange} ref={node => this.input = node}/>
					</form>
					<div className='todo-list'>
						<TodoList
							todos={this.props.todos}
							remove={this.handleRemove}
							complete={this.handleComplete}
							incomplete={this.handleIncomplete}
						/>
					</div>
				</Pane>
			</div>
		);
	}

}

const Todo = ({ todo, remove, complete, incomplete }) => {
	const toggleComplete = () => {
		todo.complete ? incomplete(todo) : complete(todo);
	}

	const classNames = todo.complete ? 'complete' : '';
	return (
		<li className={classNames} onClick={toggleComplete}>
			{ todo.title }
		</li>
	);
}

const TodoList = ({ todos, remove, complete, incomplete }) => {
	const listItems = todos.map((todo) => {
		return (
			<Todo
				todo={todo}
				key={todo._id}
				remove={remove}
				complete={complete}
				incomplete={incomplete}
			/>
		);
	});

	return (
		<ul>{listItems}</ul>
	);
}

const mapStore = async (store, props) => {
	const list = await store.findRecord(props.listId);
	console.log('found list', list)
	let todos = [];
	if (list && Array.isArray(list.todos)) {
		todos = await store.findRecords(list.todos);
		console.log('found todos', todos)
	}
	return {
		todos
	}
};

export default store.connect(mapStore)(TodoContainer);
