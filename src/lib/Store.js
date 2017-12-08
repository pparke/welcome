import React from 'react';
import PouchDB from 'pouchdb';
import pouchdbfind from 'pouchdb-find';
import pouchdbsearch from 'pouchdb-quick-search';
import uuid from 'uuid/v1';
import merge from 'deepmerge';
import clone from 'clone';
import config from '../../config.js';
const singleton = Symbol();
const enforcer = Symbol();

PouchDB.plugin(pouchdbfind);
PouchDB.plugin(pouchdbsearch);

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

		this.subscribers = new Set();

		this.setupDB();

		if ('serviceWorker' in navigator && config.serviceWorker) {
			navigator.serviceWorker(config.serviceWorker)
			.then(() => console.log('service worker loaded'));
		}
	}

	setupDB() {
		this.db = new PouchDB('todos');
		console.log(this)
	}

	async find(request) {
		const result = await this.db.find(request);
		if (request.limit === 1) {
			return result.docs[0];
		}
		return result.docs;
	}

	async search(query, fields) {
		const result = await this.db.search({
			query,
			fields,
			include_docs: true
		});

		return {
			docs: result.rows.map(row => row.doc),
			scores: result.rows.map(row => row.score)
		};
	}

	async findRecord(id) {
		let result = {};
		try {
			result = await this.db.get(id);
		}
		catch (err) {
			if (err.name === 'not_found') {
				console.log(`Document not found ${err.docId}`);
			}
		}
		return result;
	}

	async findRecords(ids) {
		const result = await this.db.allDocs({
			include_docs: true,
			keys: ids
		});
		return result.rows.map(row => row.doc);
	}

	async findFirst(name) {
		const result = await this.db.allDocs({
			include_docs: true,
			startkey: name,
			endkey: `${name}_\ufff0`,
			limit: 1
		});
		const doc = result.rows.length > 0 ? result.rows[0].doc : null;
		return doc;
	}

	async findAll(name) {
		const result = await this.db.allDocs({
			include_docs: true,
			startkey: name,
			endkey: `${name}\ufff0`
		});

		return result.rows.map(row => row.doc);
	}

	/**
	 * Creates a document obj
	 * @param  {string} name
	 * @param  {object} body
	 * @return {object}
	 */
	createDoc(name, body) {
		if (Array.isArray(name)) {
			name = name.join('/');
		}
		const id = `${name}/${uuid()}`;
		const doc = Object.assign({}, body, {
			_id: id,
			created_on: Date.now(),
			updated_on: Date.now()
		});
		return doc;
	}

	/**
	 * Create a new record with the data contained in body
	 * name should be a meaningful namespace which will have
	 * a unique uuid appended to it
	 * @param  {string|array}  name
	 * @param  {object}  body
	 * @return {Promise}
	 */
	async createRecord(name, body) {
		const doc = this.createDoc(name, body);
		return this.insertDoc(doc);
	}

	async insertDoc(doc) {
		const result = await this.db.put(doc);
		this.publish();
		return result;
	}

	async createRecords(name, docs) {
		docs = docs.map(doc => this.createDoc(name, doc));
		return this.insertDocs(docs);
	}

	async insertDocs(docs) {
		const result = await this.db.bulkDocs(docs);
		this.publish();
		return result;
	}

	async removeRecord(id) {
		const record = await this.db.get(id);
		record._deleted = true;
		record.deleted_on = Date.now();
		const result = await this.db.put(record);
		this.publish();
		return result;
	}

	async removeRecords(ids) {
		const recordResult = await this.db.allDocs({
			include_docs: true,
			keys: ids
		});
		const docs = recordResult.rows.map(row => {
			const doc = row.doc;
			doc._deleted = true;
			doc.deleted_on = Date.now();
			return doc;
		});

		console.log('docs are', docs)

		const result = await this.db.bulkDocs(docs);
		this.publish();
		return result;
	}

	async updateRecord(id, body) {
		const record = await this.db.get(id);
		const updated = Object.assign({}, record, body);
		updated.updated_on = Date.now();
		const result = await this.db.put(updated);
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

					this.updateAsyncData = this.updateAsyncData.bind(this);
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

				updateAsyncData() {
					const result = stateMap(store, this.props);
					if (result instanceof Promise) {
						result.then((data) => {
							this.setState({
								data
							});
						})
						.catch((err) => {
							console.log('Biffed it, error:', err);
							throw err;
						});
					}
					else {
						this.setState({ data: result });
					}
				}

				componentDidMount() {
					this.updateAsyncData();
					this.unsubscribe = store.subscribe(this.handleChange.bind(this));
				}

				componentWillUnmount() {
					this.unsubscribe();
				}

				handleChange() {
					this.updateAsyncData();
					this.forceUpdate();
				}

			}
		}
	}
}

const store = Store.instance;

export default store;
