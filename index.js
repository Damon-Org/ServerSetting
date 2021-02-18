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
            name: 'serverSettings',
            scope: {
                group: 'server',
                name: 'settings'
            },
            requires: [],
            events: [
                {
                    name: 'guildCreate',
                    call: '_onGuildJoin'

                },
                {
                    name: 'ready',
                    call: '_onReady'
                }
            ]
        });
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

    initScope() {
        if (this.modules.mongodb.ready) this.getAll();
        else this.modules.mongodb.on('ready', () => this.getAll());
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
        await server.settings.awaitData();

        if (!server.settings.data.prefix) return this.globalStorage.get('prefix');

        return server.settings.data.prefix;
    }

    /**
     * @private
     * @param {Guild} guild 
     */
    _onGuildJoin(guild) {
        ServerModel.createIfNotExists(guild.id);
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
    init() {
        this.modules.commandHandler.setPrefixSupplier((...args) => this._getPrefix(...args));

        return true;
    }
}
