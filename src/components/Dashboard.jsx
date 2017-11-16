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
  }

  componentDidMount() {
    const { user } = this.props;
    console.log('props are =>', this.props)
    const todos = store.findAll('todos', user.id);
  }

  componentWillReceiveProps(next) {
    console.log('next props', next);
  }

  render() {
    const todos = this.props.todos;
    console.log('todos', todos)
    return (
      <div className='dashboard'>
        <div className='column-container'>
          <Todo title={'Todo'} items={todos} />
          <Todo title={'Doing'} items={todos} />
          <Todo title={'Done'} items={todos} />
        </div>
      </div>
    );
  }
}

const mapStore = store => {
    const state = store.state;
    console.log('state is', state)

    // get all the sectors in the current system
    const todos = store.findAll('todo', state.user.id);
    return {
      user: state.user,
      todos
    };
};

export default store.connect(mapStore)(Dashboard);
