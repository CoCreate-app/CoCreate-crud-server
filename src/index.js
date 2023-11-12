'use strict';

const { ObjectId, searchData, sortData } = require("@cocreate/utils");
const Config = require('@cocreate/config')

class CoCreateCrudServer {
    constructor(wsManager, databases) {
        this.wsManager = wsManager
        this.databases = databases
        this.ObjectId = ObjectId
        this.organizations = {};
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
            const type = ['storage', 'database', 'array', 'index', 'object'];
            const method = ['create', 'read', 'update', 'delete'];

            for (let i = 0; i < type.length; i++) {
                for (let j = 0; j < method.length; j++) {
                    const action = type[i] + '.' + method[j];
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

                let storages = await this.getStorage(data)
                if (storages.error)
                    return resolve(storages)

                if (!data['timeStamp'])
                    data['timeStamp'] = new Date().toISOString()

                // TODO: manage error handling if if no method defined
                if (data.method.endsWith('.update') && data.upsert != false)
                    data.upsert = true

                if (data.array) {
                    if (!data.database)
                        data['database'] = data.organization_id

                    if (data.method === 'object.update' && data.organization_id !== this.config.organization_id) {
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
                                        platformobject.update[0][key] = object[key]
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
                                let type = data.method.split(".")[0]
                                if (data.$filter.sort && data.$filter.sort.length)
                                    data[type] = sortData(data[type], data.$filter.sort)
                                if (!data.$filter.index)
                                    data.$filter.index = 0
                                data.$filter.index += data[type].length
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
                }
                resolve(data)
            } catch (error) {
                if (data.socket) {
                    this.errorHandler(data, error)
                    this.wsManager.send(data);
                }

                resolve(data)
            }
        });
    }

    async getStorage(data) {
        if (this.organizations[data.organization_id])
            return await this.organizations[data.organization_id]

        if (data.organization_id === this.config.organization_id) {
            this.organizations[data.organization_id] = this.config.storage
            return this.config.storage
        } else {
            if (this.organizations[data.organization_id]) {
                return await this.organizations[data.organization_id]
            } else {
                this.organizations[data.organization_id] = this.getOrganization(data)
                this.organizations[data.organization_id] = await this.organizations[data.organization_id]
                return this.organizations[data.organization_id]
            }
        }

    }

    async getOrganization(data) {
        let organization = await this.send({
            method: 'object.read',
            database: this.config.organization_id,
            array: 'organizations',
            object: [{ _id: data.organization_id }],
            organization_id: this.config.organization_id
        })

        if (organization
            && organization.object
            && organization.object[0]) {
            if (organization.object[0].storage) {
                return organization.object[0].storage
            } else
                return { serverStorage: false, error: 'A storage url could not be found' }
        } else {
            return { serverOrganization: false, error: 'An organization could not be found' }
        }

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