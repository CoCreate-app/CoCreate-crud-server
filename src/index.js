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
            'name': {
                prompt: 'Enter a friendly name for the new storage: ',
                variable: true
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
            this.wsManager.on('createDatabase', (socket, data) => this.crud(socket, 'createDatabase', data))
            this.wsManager.on('readDatabase', (socket, data) => this.crud(socket, 'readDatabase', data))
            this.wsManager.on('updateDatabase', (socket, data) => this.crud(socket, 'updateDatabase', data))
            this.wsManager.on('deleteDatabase', (socket, data) => this.crud(socket, 'deleteDatabase', data))
            this.wsManager.on('createCollection', (socket, data) => this.crud(socket, 'createCollection', data))
            this.wsManager.on('readCollection', (socket, data) => this.crud(socket, 'readCollection', data))
            this.wsManager.on('updateCollection', (socket, data) => this.crud(socket, 'updateCollection', data))
            this.wsManager.on('deleteCollection', (socket, data) => this.crud(socket, 'deleteCollection', data))
            this.wsManager.on('createDocument', (socket, data) => this.crud(socket, 'createDocument', data))
            this.wsManager.on('readDocument', (socket, data) => this.crud(socket, 'readDocument', data))
            this.wsManager.on('updateDocument', (socket, data) => this.crud(socket, 'updateDocument', data))
            this.wsManager.on('deleteDocument', (socket, data) => this.crud(socket, 'deleteDocument', data))
        }
    }

    async databaseStats(data) {
        data = await this.crud('', 'databaseStats', data)
        return data
    }

    async createDatabase(data) {
        data = await this.crud('', 'createDatabase', data)
        return data
    }

    async readDatabase(data) {
        data = await this.crud('', 'readDatabase', data)
        return data
    }

    async updateDatabase(data) {
        data = await this.crud('', 'updateDatabase', data)
        return data
    }

    async deleteDatabase(data) {
        data = await this.crud('', 'deleteDatabase', data)
        return data
    }

    async createCollection(data) {
        data = await this.crud('', 'createCollection', data)
        return data
    }

    async readCollection(data) {
        data = await this.crud('', 'readCollection', data)
        return data
    }

    async updateCollection(data) {
        data = await this.crud('', 'updateCollection', data)
        return data
    }

    async deleteCollection(data) {
        data = await this.crud('', 'deleteCollection', data)
        return data
    }

    async createDocument(data) {
        data = await this.crud('', 'createDocument', data)
        return data
    }

    async readDocument(data) {
        data = await this.crud('', 'readDocument', data)
        return data
    }

    async updateDocument(data) {
        data = await this.crud('', 'updateDocument', data)
        return data
    }

    async deleteDocument(data) {
        data = await this.crud('', 'deleteDocument', data)
        return data
    }

    async crud(socket, action, data) {
        return new Promise(async (resolve) => {
            try {
                if (!data.organization_id)
                    return resolve()

                let storage = this.storages.get(data.organization_id)
                if (storage === false)
                    return resolve({ storage: false, error: 'A storage or database could not be found' })

                if (!storage) {
                    if (data.organization_id === this.config.orgaization_id) {
                        storage = pthis.config.storage
                        if (storage)
                            this.storages.set(data.organization_id, JSON.parse(storage))
                    } else {
                        let organization = await this.readDocument({
                            database: this.config.organization_id,
                            collection: 'organizations',
                            document: [{ _id: data.organization_id }],
                            organization_id: this.config.organization_id
                        })
                        if (organization && organization.document && organization.document[0])
                            organization = organization.document[0]
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

                if (action == 'updateDocument' && data.upsert != false)
                    data.upsert = true

                // TODO: support stats from multiple dbs 
                if (data.collection || action === 'databaseStats') {
                    if (!data.database)
                        data['database'] = data.organization_id

                    if (action === 'updateDocument' && data.organization_id !== this.config.organization_id) {
                        let syncKeys
                        if (data.collection === 'organizations')
                            syncKeys = ['name', 'logo', 'databases', 'host', 'apis']
                        else if (data.collection === 'users')
                            syncKeys = ['name', 'email', 'password', 'avatar']

                        if (syncKeys && syncKeys.length) {
                            let platformUpdate = {
                                database: this.config.organization_id,
                                collection: data.collection,
                                document: [{}],
                                organization_id: this.config.organization_id
                            }

                            let document = data.document[0] || data.document
                            if (document) {
                                for (let key of syncKeys) {
                                    if (document[key])
                                        platformUpdate.document[0][key] = document[key]
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

                            //TODO: sorting should take place here in order to return sorted values from multiple dbs
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
                        }, action, { ...data });
                        data.organization_id = socket.config.organization_id
                    }

                    this.wsManager.broadcast(socket, action, data);
                    process.emit('changed-document', data)
                    resolve()
                } else {
                    resolve(data)
                }
            } catch (error) {
                if (socket) {
                    this.errorHandler(data, error)
                    this.wsManager.send(socket, action, data);
                    resolve()
                } else {
                    resolve(data)
                }
            }
        });
    }

    errorHandler(data, error, database, collection) {
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