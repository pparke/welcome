import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

// components
import Navbar from './Navbar';
import Page from './Page';
import Pane from './Pane';
import Dashboard from './Dashboard';
import Signup from './Signup';
import Login from './Login';

// styles
import '../scss/app.scss';

// lib
import state from '../../assets/data/initialState';

const Welcome = () => (
  <h1 className='welcome'>Welcome</h1>
);

const App = () => (
	<div className='app'>
		<Navbar title={state.title} items={state.menus.main.items}/>
		<Switch>
			<Route exact path='/' component={Welcome}/>
			<Route path='/dashboard' component={Dashboard} />
			<Route path='/signup' component={Signup} />
			<Route path='/login' component={Login} />
		</Switch>
	</div>
);

export default App;
