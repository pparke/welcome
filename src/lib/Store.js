import React from 'react';
import PouchDB from 'pouchdb';
import uuid from 'uuid/v1';
import merge from 'deepmerge';
import clone from 'clone';
import config from '../../config.js';
const singleton = Symbol();
const enforcer = Symbol();

/**
* Creates a singleton that acts as the interface and container of
* a Map.  Defines a few custom methods for working with the map
* and proxies the existing methods of the Map object.
*/
export class Store {

	/**
	 * Prevent multiple instantiation
	 * @param  {[type]} enf [description]
	 * @return {[type]}     [description]
	 */
	constructor(enf) {
		if (enf !== enforcer) {
			throw new Error('Cannot instantiate more than one store.');
		}
		// local state or session data specific to this instance
		this._state = {};
		// raw data provided by the api
		this._data = {};
		// application defined views into the api data (think sql views)
		this._views = {};
		// application defined models that determine how
		this._models = {};

		this.subscribers = new Set();

		this.db = new PouchDB('todos');

		this.adapter = {
			local: {
			}
		}

		if ('serviceWorker' in navigator && config.serviceWorker) {
			navigator.serviceWorker(config.serviceWorker)
			.then(() => console.log('service worker loaded'));
		}
	}

	async findRecord(name, id) {
		return this.db.get(`${name}_${id}`);
	}

	async findRecords(name, ids) {
		const result = await this.db.allDocs({
			include_docs: true,
			keys: ids.map(id => `${name}_${id}`)
		});
		return result.rows;
	}

	async findAll(name) {
		console.log('find all', name);
		const result = await this.db.allDocs({
			include_docs: true,
			startkey: name,
			endkey: `${name}\ufff0`
		});
		console.log('got result', result)
		return result.rows.map(row => ({
			id: row.id,
			title: row.doc.title
		}));
	}

	async createRecord(name, body) {
		const id = name + '_' + uuid();
		body._id = id;
		console.log('creating record', body)
		const result = await this.db.put(body);
		this.publish();
		return result;
	}

	/**
	 * Return the singleton store instance
	 * @type {[type]}
	 */
	static get instance() {
		// if a store instance doesn't exist, create one
		if (!this[singleton]) {
			this[singleton] = new Store(enforcer);
		}
		return this[singleton];
	}

	/**
	 * Initialize the store state and data
	 * @param  {[type]} state [description]
	 * @return {[type]}       [description]
	 */
	initialize(state = {}, data = {}) {
		this._state = clone(state);
		this._data = clone(data);
	}

	/**
	 * Return the store state
	 * @return {[type]} [description]
	 */
	get state() {
		return this._state;
	}

	setState(partial) {
		this._state = merge(this._state, partial);
		console.log('state is now', this._state);
		this.publish();
	}

	/**
	 * Subscribe to state updates
	 * @param  {Function} fn [description]
	 * @return {[type]}      [description]
	 */
	subscribe(fn) {
		this.subscribers.add(fn);

		return () => {
			this.subscribers.delete(fn);
		}
	}

	/**
	 * Notify all subscribers
	 * @return {[type]} [description]
	 */
	publish() {
		for (let fn of this.subscribers) {
			fn();
		}
	}

	/**
	 * Connect a component to the store by wrapping it and
	 * forcing an update when the store updates
	 * @param  {[type]} stateMap [description]
	 * @return {[type]}          [description]
	 */
	connect(stateMap) {
		const store = this;
		return function(WrappedComponent) {
			return class extends React.Component {
				constructor(props) {
					super(props);
					this.state = {
						data: null
					}
				}

				render() {
					if (this.state.data) {
						return (
							<WrappedComponent
								{...this.props}
								{...this.state.data}
							/>
						);
					}
					return <div> Loading... </div>;
				}

				componentDidMount() {
					this.unsubscribe = store.subscribe(this.handleChange.bind(this));

					console.log('mounted')
					const result = stateMap(store, this.props);
					if (result instanceof Promise) {
						console.log('promise', result)
						result.then((data) => {
							this.setState({
								data
							});
						})
						.catch((err) => {
							console.log('Biffed it, error:', err);
						});
					}
					else {
						this.setState({ data: result });
					}
				}

				componentWillUnmount() {
					this.unsubscribe();
				}

				handleChange() {
					this.forceUpdate();
				}

			}
		}
	}
}

const store = Store.instance;

export default store;
