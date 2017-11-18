import React from 'react';
import store from '../lib/Store';
import config from '../../config';
import { Redirect } from 'react-router'

// components
import Pane from './Pane';

// assets
import '../scss/signup.scss';


class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: ''
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	async handleSubmit(event) {
		event.preventDefault();
		const result = await loginRequest(this.state.username, this.state.password);

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
			<div className='login'>
				<Pane theme={'clear'} title={'SIGNUP'} contentLayout={'column'}>
					<form onSubmit={this.handleSubmit}>
						<label>
							Username:
							<input type="text" name="username" onChange={this.handleChange}/>
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

async function loginRequest(username, password) {
	const response = await fetch(`${config.api.url}/login`, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic '+btoa(`${username}:${password}`),
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
	const json = await response.json();
	return json;
}

const mapStore = store => {
	return {
		loggedIn: store.state.player.loggedIn
	}
};

export default store.connect(mapStore)(Login);
