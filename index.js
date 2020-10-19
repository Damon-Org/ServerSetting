import ServerModule from './structures/ServerModule.js'

import ServerModel from './structures/models/ServerModel.js'

export default class ServerSetting extends ServerModule {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super(main);

        this.register(ServerSetting, {
            name: 'setting',
            scope: 'server',
            requires: [],
            events: [
                {
                    name: 'ready',
                    call: '_onReady'
                },
                {
                    mod: 'mongodb',
                    name: 'ready',
                    call: '_mongoReady'
                }
            ]
        });

        this._ready = false;
    }

    /**
     * @private
     */
    async _createBulk() {
        const amount = await ServerModel.createBulkUnique(this._m.guilds.cache);

        this.log.info('SERVER_SETTINGS', `Added ${amount} new servers to DB.`);
    }

    /**
     * @private
     */
    _onReady() {
        this._createBulk();
    }

    /**
     * @private
     */
    _mongoReady() {

    }

    /**
     * @param {Object} update
     * @returns {Promise<mongoose.Query>}
     */
    update(update) {
        return ServerModel.updateServer(this.server.id, update);
    }

    /**
     * Is not called when initiated for a server
     */
    setup() {
        return true;
    }
}
