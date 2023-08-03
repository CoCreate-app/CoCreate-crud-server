'use strict';

const { ObjectId, searchData, sortData } = require("@cocreate/utils");
const Config = require('@cocreate/config')

class CoCreateCrudServer {
    constructor(wsManager, databases) {
        this.wsManager = wsManager
        this.databases = databases
        this.ObjectId = ObjectId
        this.storages = new Map();
        this.init()
    }

    async init() {
        this.config = await Config({
            'organization_id': { prompt: 'Enter your organization_id: ' },
            'storage': {
                prompt: 'Enter a friendly name for the new storage: ',
                variable: 'name'
            },
            'storage.{{name}}.provider': {
                prompt: 'Enter the storage provider, ex mongodb: '
            },
            'storage.{{name}}.url': {
                prompt: 'Enter the storage providers url: '
            }
        })

        let dbUrl
        if (this.config.storage) {
            if (typeof this.config.storage === 'string')
                this.config.storage = JSON.parse(this.config.storage)
            let defaultStorage = Object.keys(this.config.storage)
            dbUrl = this.config.storage[defaultStorage[0]].url
        }

        if (!this.config.organization_id)
            console.log('Could not find the organization_id')
        if (!dbUrl)
            console.log('Could not find a url in your storage object')
        if (!dbUrl && !this.config.organization_id)
            process.exit()

        if (this.wsManager) {
            const method = ['create', 'read', 'update', 'delete'];
            const type = ['storage', 'database', 'array', 'index', 'object'];

            for (let i = 0; i < method.length; i++) {
                for (let j = 0; j < type.length; j++) {
                    const action = method[i] + '.' + type[j];
                    this.wsManager.on(action, (socket, data) => this.crud(socket, data))
                }
            }
        }
    }

    async send(data) {
        data = await this.crud('', data)
        return data
    }

    async crud(socket, data) {
        return new Promise(async (resolve) => {
            try {
                if (!data.organization_id || !this.config)
                    return resolve()
                if (!this.config)
                    this.config = await Config({
                        'organization_id': { prompt: 'Enter your organization_id: ' },
                        'storage': {
                            prompt: 'Enter a friendly name for the new storage: ',
                            variable: 'name'
                        },
                        'storage.{{name}}.provider': {
                            prompt: 'Enter the storage provider, ex mongodb: '
                        },
                        'storage.{{name}}.url': {
                            prompt: 'Enter the storage providers url: '
                        }
                    })



                let storage = this.storages.get(data.organization_id)
                if (storage === false)
                    return resolve({ storage: false, error: 'A storage or database could not be found' })

                if (!storage) {
                    if (data.organization_id === this.config.organization_id) {
                        storage = this.config.storage
                        if (storage)
                            this.storages.set(data.organization_id, storage)
                    } else {
                        let organization = await this.send({
                            method: 'read.object',
                            database: this.config.organization_id,
                            array: 'organizations',
                            object: [{ _id: data.organization_id }],
                            organization_id: this.config.organization_id
                        })
                        if (organization && organization.object && organization.object[0])
                            organization = organization.object[0]
                        if (organization && organization.storage) {
                            storage = organization.storage
                            this.storages.set(data.organization_id, storage)
                        } else {
                            this.storages.set(data.organization_id, false)
                            if (organization)
                                return resolve({ storage: false, error: 'database url could not be found' })
                            else
                                return resolve({ organization: false, error: 'organization could not be found' })
                        }
                    }
                }

                if (!data['timeStamp'])
                    data['timeStamp'] = new Date().toISOString()

                if (data.method.startsWith('update') && data.upsert != false)
                    data.upsert = true

                let action = data.method.replace(/\.([a-z])/g, (_, match) => match.toUpperCase());
                // TODO: support stats from multiple dbs 
                if (data.array || data.method === 'databaseStats') {
                    if (!data.database)
                        data['database'] = data.organization_id

                    if (data.method.startsWith('update.object') && data.organization_id !== this.config.organization_id) {
                        let syncKeys
                        if (data.array === 'organizations')
                            syncKeys = ['name', 'logo', 'databases', 'host', 'apis']
                        else if (data.array === 'users')
                            syncKeys = ['name', 'email', 'password', 'avatar']

                        if (syncKeys && syncKeys.length) {
                            let platformUpdate = {
                                database: this.config.organization_id,
                                array: data.array,
                                object: [{}],
                                organization_id: this.config.organization_id
                            }

                            let object = data.object[0] || data.object
                            if (object) {
                                for (let key of syncKeys) {
                                    if (object[key])
                                        platformUpdate.object[0][key] = object[key]
                                }
                            }

                            this[action](platformUpdate)
                        }

                    }

                }

                if (!data.storage || !data.storage.length) {
                    data.storage = [Object.keys(storage)[0]]
                } else if (!Array.isArray(data.storage))
                    data.storage = [data.storage]

                for (let i = 0; i < data.storage.length; i++) {
                    if (storage && storage[data.storage[i]]) {
                        let db = storage[data.storage[i]]

                        if (db.provider && this.databases[db.provider]) {
                            if (!Array.isArray(db.url))
                                db.url = [db.url]
                            for (let i = 0; i < db.url.length; i++) {
                                data['dbUrl'] = db.url[i]
                                data = await this.databases[db.provider][action](data)
                            }

                            if (data.filter) {
                                if (data.filter.sort && data.filter.sort.length)
                                    data[data.type] = sortData(array, data.filter.sort)
                                if (data.filter.index && data.filter.limit) {
                                    data[data.type] = data[data.type].slice(data.filter.index, data.filter.limit)
                                }
                                data.filter.count = data[data.type].length
                            }

                        }
                    }
                }

                delete data.dbUrl
                if (socket) {
                    if (data.organization_id === this.config.organization_id && socket.config.organization_id !== data.organization_id) {
                        this.wsManager.broadcast({
                            config: {
                                organization_id: this.config.organization_id,
                            }
                        }, { ...data });
                        data.organization_id = socket.config.organization_id
                    }

                    this.wsManager.broadcast(socket, data);
                    process.emit('changed-object', data)
                    resolve()
                } else {
                    resolve(data)
                }
            } catch (error) {
                if (socket) {
                    this.errorHandler(data, error)
                    this.wsManager.send(socket, data);
                    resolve()
                } else {
                    resolve(data)
                }
            }
        });
    }

    errorHandler(data, error, database, array) {
        if (typeof error == 'object')
            error['storage'] = 'mongodb'
        else
            error = { location: 'crudServer', message: error }

        if (database)
            error['database'] = database

        if (data.error)
            data.error.push(error)
        else
            data.error = [error]
    }
}

module.exports = CoCreateCrudServer;