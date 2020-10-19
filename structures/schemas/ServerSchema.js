import mongoose from 'mongoose'

const servers = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: String,
    lockedChannels: [
        {
            category: String,
            channelId: String
        }
    ],
    joinDate: { type: Date, default: Date.now }
}, { collection: 'Servers' });

export default mongoose.model('Servers', servers);
