import mongoose from 'mongoose'

const servers = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },

    djMode: Number,
    prefix: String,
    lockedChannels: [
        {
            category: String,
            channelId: String
        }
    ],
    joinDate: { type: Date, default: Date.now },
    music_system: {
        volume: { type: Number }
    },
    reminders: {
        permissions: { type: Date, default: 0 }
    }
});

export default mongoose.model('servers', servers);
