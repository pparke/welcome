import React from 'react';
import { joinGame } from '../lib/api';
import store from '../lib/Store';
import config from '../../config';
import { checkContentType } from '../lib/api';
import { Redirect } from 'react-router'
// components
import Pane from './Pane';

// assets
import '../scss/todo.scss';


class TodoContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			listId: null,
			newTodo: {
				title: ''
			},
			todos: []
		};

		this.input = null;

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
	}

	componentWillReceiveProps(next) {
    console.log('todos next props', next);
  }

	handleChange(event) {
		this.setState({
			newTodo: {
				title: event.target.value
			}
		});
	}

	async handleSubmit(event) {
		event.preventDefault();

		try {
			const result = await addTodo(this.state.newTodo);
			console.log('add todo returned', result)

			this.setState({
				todos: result
			});

			this.input.value = '';
		}
		catch (err) {
			console.log(err);
		}
	}

	handleRemove(todo) {
		console.log('removing todo', todo);
	}

	render() {
		return (
			<div className='todo-container'>
				<Pane theme={'clear'} title={this.props.title} contentLayout={'column'}>
					<form onSubmit={this.handleSubmit}>
						<input className='todo-input' type="text" name="newTodo" onChange={this.handleChange} ref={node => this.input = node}/>
					</form>
					<div className='todo-list'>
						<TodoList todos={this.props.todos} remove={this.handleRemove}/>
					</div>
				</Pane>
			</div>
		);
	}

}

const Todo = ({ todo, remove }) => {
	return (
		<li onClick={remove.bind(this, todo._id)}>
			{ todo.title }
		</li>
	);
}

const TodoList = ({ todos, remove }) => {
	const todoNode = todos.map((todo) => {
		return (
			<Todo todo={todo} key={todo.id} remove={remove} />
		);
	});

	return (
		<ul>{todoNode}</ul>
	)
}

async function addTodo(todo) {
	const record = await store.createRecord('todo', todo);
	console.log('new record is', record)
	return store.findAll('todo');
}

const mapStore = async store => {
	const todos = await store.findAll('todo', store.state.user.id);
	console.log('map store', todos)
	return {
		todos
	}
};

export default store.connect(mapStore)(TodoContainer);
