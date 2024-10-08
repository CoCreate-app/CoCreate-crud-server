'use strict';

const { ObjectId, sortData } = require("@cocreate/utils");
const Config = require('@cocreate/config')

class CoCreateCrudServer {
    constructor(wsManager, databases) {
        this.wsManager = wsManager
        this.databases = databases
        this.ObjectId = ObjectId
        this.organizations = {};
        this.hosts = {};
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
                if (!data.organization_id || !this.config) {
                    data.error = 'Missing an organization_id'
                    return resolve(data)
                }

                let organization = await this.getOrganization(data)

                if (organization.error)
                    return resolve(organization)

                let storages = organization.storage
                if (!storages)
                    return resolve({ serverStorage: false, error: 'A storage url could not be found' })

                if (!data['timeStamp'])
                    data['timeStamp'] = new Date().toISOString()

                if (data.array) {
                    if (!data.database)
                        data['database'] = data.organization_id

                    if (data.method === 'object.update' && data.organization_id !== this.config.organization_id) {
                        let syncKeys
                        if (data.array === 'organizations')
                            syncKeys = ['name', 'logo', 'storage', 'host']
                        else if (data.array === 'userssss')
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

                            // this.send(platformUpdate)
                        }
                    }
                }

                if (organization.host) {
                    let host = organization.host
                    for (let i = 0; i < host.length; i++) {
                        let hostname
                        if (data.socket)
                            hostname = data.socket.host
                        else
                            hostname = data.host
                        if (host[i].name === hostname) {
                            if (host[i].storage)
                                data.storage = host[i].storage
                            if (host[i].database)
                                data.database = host[i].database
                            if (host[i].array)
                                data.array = host[i].array
                            break
                        }
                    }
                }

                if (!data.storage || !data.storage.length) {
                    if (Array.isArray(storages))
                        data.storage = storages[0].name
                    else
                        data.storage = [Object.keys(storages)[0]]
                }

                if (!Array.isArray(data.storage))
                    data.storage = [data.storage]

                for (let i = 0; i < data.storage.length; i++) {
                    let storage;
                    if (Array.isArray(storages)) {
                        storage = storages.find((obj) => obj.name === data.storage[i]);
                    } else if (typeof storages === 'object' && storages !== null) {
                        storage = storages[data.storage[i]];
                    }

                    if (storage) {
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
                                data.$filter.startingIndex = data.$filter.index
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
                    process.emit('crud-event', data)
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


    async getOrganization(data) {
        if (this.hosts[data.host]) {
            return await this.hosts[data.host]
        } else if (this.organizations[data.organization_id]) {
            return await this.organizations[data.organization_id]
        } else {
            if (data.organization_id) {
                this.organizations[data.organization_id] = this.getOrg(data)
                this.organizations[data.organization_id] = await this.organizations[data.organization_id]
                return this.organizations[data.organization_id]
            } else if (data.host) {
                // this.hosts[data.host] = this.getOrg(data)
                this.hosts[data.host] = await this.getOrg(data)
                return this.hosts[data.host]
            }
        }
    }

    async getOrg(data) {
        let query = {
            method: 'object.read',
            host: data.host,
            database: this.config.organization_id,
            array: 'organizations',
            organization_id: this.config.organization_id
        }

        if (this.organizations[data.organization_id])
            data.database = data.organization_id = data.organization_id

        if (data.organization_id)
            query.object = [{ _id: data.organization_id }]
        else if (data.host)
            query.$filter = {
                query: { host: { $elemMatch: { name: { $in: [data.host] } } } },
                limit: 1
            }
        else
            return { serverOrganization: false, error: 'An organization could not be found' }

        if (!this.organizations[query.organization_id] && query.organization_id === this.config.organization_id)
            this.organizations[query.organization_id] = { ...this.config, isConfig: true }

        let organization = await this.send(query)

        if (organization
            && organization.object
            && organization.object[0]) {
            if (!this.organizations[organization.object[0]._id] || this.organizations[query.organization_id].isConfig) {
                this.organizations[organization.object[0]._id] = organization.object[0]

                delete query.$filter
                query.database = query.organization_id = organization.object[0]._id
                let org = await this.send(query)
                if (org
                    && org.object
                    && org.object[0]) {
                    if (data.host)
                        this.hosts[data.host] = org.object[0]
                    return org.object[0]
                } else {
                    return { serverOrganization: false, error: 'An organization could not be found in the specified dbUrl' }
                }
            } else {
                if (data.host)
                    this.hosts[data.host] = organization.object[0]
                return organization.object[0]
            }
        }
        return { serverOrganization: false, error: 'An organization could not be found' }
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