import mongoose from 'mongoose';

const clickSchema = mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"URL",
        required: true
    },
    device: String,
    browser: String,
    os: String,

    country: String,
    referrer: String,

    ip: String,
    userAgent: String,

    timestamp: {
        type: Date,
        default: Date.now
    }
})

const Click = mongoose.model("Click", clickSchema);
export default Click;