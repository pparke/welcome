import React from 'react';
import ReactDOM from 'react-dom';
import './scss/core.scss';
import Root from './components/Root';
import store from './lib/Store';

import state from '../assets/data/initialState';
store.initialize(state);

ReactDOM.render(
  <Root />,
  document.getElementById('app')
);
