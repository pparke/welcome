import React from 'react';
import { joinGame } from '../lib/api';
import store from '../lib/Store';
import config from '../../config';
import { checkContentType } from '../lib/api';
import { Redirect } from 'react-router'

// components
import Pane from './Pane';

// assets
import '../scss/signup.scss';


class Signup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			email: '',
			password: '',
			userid: '',
			token_public: '',
			token_expires: ''
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		console.log(event.target, event.target.name, event.target.value);
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	async handleSubmit(event) {
		event.preventDefault();
		const result = await signupRequest({
			username: this.state.username,
			password: this.state.password,
			email: this.state.email
		});

		console.log('got result', result);

		store.setState({
			player: {
				userid: result.userid,
				token_public: result.token_public,
				token_expires: result.token_expires,
				loggedIn: true
			}
		});
	}

	render() {
		if (this.props.loggedIn) {
			return (
				<Redirect to='/dashboard' />
			);
		}
		return (
			<div className='signup'>
				<Pane theme={'clear'} title={'SIGNUP'} contentLayout={'column'}>
					<form onSubmit={this.handleSubmit}>
						<label>
							Username:
							<input type="text" name="username" onChange={this.handleChange}/>
						</label>
						<label>
							Email:
							<input type="email" name="email" onChange={this.handleChange} />
						</label>
						<label>
							Password:
							<input type="password" name="password" onChange={this.handleChange} />
						</label>
						<input type="submit" value="Submit" />
					</form>
				</Pane>
			</div>
		)
	}

}

async function signupRequest(data) {
	const response = await fetch(`${config.api.url}/login/new`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	checkContentType(response);
	const json = await response.json();
	return json;
}

const mapStore = store => {
	return {
		loggedIn: store.state.player.loggedIn
	}
};

export default store.connect(mapStore)(Signup);
