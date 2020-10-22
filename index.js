import ServerModule from './structures/ServerModule.js'

import ServerModel from './structures/models/ServerModel.js'

export default class ServerSetting extends ServerModule {
    _data = null;

    /**
     * @param {Main} main
     * @param {Server} server
     */
    constructor(main, server) {
        super(main, server);

        this.register(ServerSetting, {
            name: 'setting',
            scope: 'server',
            requires: [],
            events: [
                {
                    name: 'ready',
                    call: '_onReady'
                }
            ]
        });

        if (this.server !== -1 && this.modules.mongodb.ready) this.getAll();
    }

    get data() {
        if (!this._data) return {};
        return this._data;
    }

/**
 * Server Methods
 */
    /**
     * @returns {Promise<void>} Returns when Mongo fetched data from the server
     */
    awaitData() {
        return new Promise((resolve, reject) => {
            if (this._data) return resolve();

            this._call = (...args) => resolve(...args);
        });
    }

    async getAll() {
        const data = await ServerModel.getAll(this.server.id);

        this._data = data;

        if (typeof this._call === 'function') this._call(data);
        this._call = null;
    }

    /**
     * @param {Object} update
     * @returns {Promise<void>}
     */
    async update(update) {
        this._data = await ServerModel.updateServer(this.server.id, update);
    }

/**
 * Global Methods
 * Methods Part of the global scope of the module
 */
    /**
     * @private
     */
    async _createBulk() {
        const amount = await ServerModel.createBulkUnique(this._m.guilds.cache);

        this.log.info('SERVER_SETTINGS', `Added ${amount} new servers to DB.`);
    }

    /**
     * @param {Server} server
     */
    async _getPrefix(server) {
        await server.setting.awaitData();

        if (!server.setting.data.prefix) return this.globalStorage.get('prefix');

        return server.setting.data.prefix;
    }

    /**
     * @private
     */
    _onReady() {
        this._createBulk();
    }

    /**
     * Is not called when initiated for a server
     */
    setup() {
        this.modules.commandHandler.setPrefixSupplier((...args) => this._getPrefix(...args));

        return true;
    }
}
