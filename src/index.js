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

        let storageUrl
        if (this.config.storage) {
            if (typeof this.config.storage === 'string')
                this.config.storage = JSON.parse(this.config.storage)
            let defaultStorage = Object.keys(this.config.storage)
            storageUrl = this.config.storage[defaultStorage[0]].url
        }

        if (!this.config.organization_id)
            console.log('Could not find the organization_id')
        if (!storageUrl)
            console.log('Could not find a url in your storage object')
        if (!storageUrl && !this.config.organization_id)
            process.exit()

        if (this.wsManager) {
            const method = ['create', 'read', 'update', 'delete'];
            const type = ['storage', 'database', 'array', 'index', 'object'];

            for (let i = 0; i < method.length; i++) {
                for (let j = 0; j < type.length; j++) {
                    const action = method[i] + '.' + type[j];
                    this.wsManager.on(action, (data) =>
                        this.send(data))
                }
            }
        }
    }

    async send(data) {
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

                let storages = this.storages.get(data.organization_id)
                if (storages === false)
                    return resolve({ serverStorage: false, error: 'A storage or database could not be found' })

                if (!storages) {
                    if (data.organization_id === this.config.organization_id) {
                        storages = this.config.storage
                        if (storages)
                            this.storages.set(data.organization_id, storages)
                    } else {
                        let organization = await this.send({
                            method: 'read.object',
                            database: this.config.organization_id,
                            array: 'organizations',
                            object: [{ _id: data.organization_id }],
                            organization_id: this.config.organization_id
                        })
                        if (organization
                            && organization.object
                            && organization.object[0]) {
                            if (organization.object[0].storage)
                                this.storages.set(data.organization_id, organization.object[0].storage)
                            else
                                return resolve({ serverStorage: false, error: 'A storage url could not be found' })
                        } else {
                            return resolve({ serverOrganization: false, error: 'An organization could not be found' })
                        }
                    }
                }

                if (data['timeStamp'])
                    data['timeStamp'] = new Date(data['timeStamp'])
                else
                    data['timeStamp'] = new Date()

                // TODO: manage error handling if if no method defined
                if (data.method.startsWith('update') && data.upsert != false)
                    data.upsert = true

                if (data.array) {
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

                            this.send(platformUpdate)
                        }

                    }

                }

                if (!data.storage || !data.storage.length) {
                    data.storage = [Object.keys(storages)[0]]
                } else if (!Array.isArray(data.storage))
                    data.storage = [data.storage]

                for (let i = 0; i < data.storage.length; i++) {
                    if (storages && storages[data.storage[i]]) {
                        let storage = storages[data.storage[i]]

                        if (storage.provider && this.databases[storage.provider]) {
                            if (!Array.isArray(storage.url))
                                storage.url = [storage.url]

                            for (let j = 0; j < storage.url.length; j++) {
                                data['storageName'] = data.storage[i]
                                data['storageUrl'] = storage.url[j]

                                data = await this.databases[storage.provider].send(data)
                            }

                            if (data.$filter) {
                                if (!data.type)
                                    data.type = data.method.split('.').pop()
                                if (data.$filter.sort && data.$filter.sort.length)
                                    data[data.type] = sortData(data[data.type], data.$filter.sort)
                                if (data.$filter.index && data.$filter.limit)
                                    data[data.type] = data[data.type].slice(data.$filter.index, data.$filter.limit)

                                data.$filter.count = data[data.type].length
                            }

                        }
                    }
                }

                delete data.storageUrl
                delete data.storageName

                if (data.socket) {
                    if (data.organization_id === this.config.organization_id && data.socket.organization_id !== data.organization_id) {
                        this.wsManager.send({
                            config: {
                                organization_id: this.config.organization_id,
                            }
                        }, { ...data });
                        data.organization_id = data.socket.organization_id
                    }

                    this.wsManager.send(data);
                    process.emit('changed-object', data)
                    resolve()
                } else {
                    resolve(data)
                }
            } catch (error) {
                if (data.socket) {
                    this.errorHandler(data, error)
                    this.wsManager.send(data);
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