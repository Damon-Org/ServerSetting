import Server from '../schemas/ServerSchema.js'

/**
 * @param {Collection} guildCollection
 * @returns {Promise<number>} The amount of new severs that have been inserted
 */
export const createBulkUnique = async (guildCollection) => {
    const guildIds = [];
    guildCollection.each(guild => guildIds.push(guild.id));

    const existing = await Server.find({
        guildId: {
            $in: guildIds
        }
    }).exec();

    const existingGuildIds = [];
    existing.forEach((doc) => existingGuildIds.push(doc.guildId));

    const unique = [];
    guildCollection.each((guild) => !existingGuildIds.includes(guild.id) ? unique.push({ guildId: guild.id }) : null);

    await Server.insertMany(unique);

    return unique.length;
}

/**
 * @param {string} guildId
 */
export const createIfNotExists = async (guildId) => {
    const doc = await Server.findOne({ guildId }).exec();
    if (!doc) {
        const create = new Server({
            guildId
        }).save();

        return create;
    }
    return doc;
}

/**
 * Alias for createIfNotExists as it also returns the document if it already existed
 */
export const getAll = async (guildId) => {
    return createIfNotExists(guildId);
}

/**
 * @param {string} guildId
 * @param {Object} update
 * @example
 * updateServer("506546161692180480", { prefix: "!" });
 * @returns {Promise<Object>} The new server document on the MongoDB server
 */
export const updateServer = (guildId, update) => {
    return Server.findOneAndUpdate({ guildId }, update, { new: true }).exec();
}

export default {
    createBulkUnique,
    createIfNotExists,
    getAll,
    updateServer
}
