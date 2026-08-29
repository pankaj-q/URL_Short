import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        console.log("DB NAME:", mongoose.connection.name);
        console.log(
          "COLLECTIONS:",
          Object.keys(mongoose.connection.collections),
        );
    } catch (error) {
        console.error("error connecting to MONGO_DB", error.message);
        process.exit(1);
    }
}

export default connectDB;