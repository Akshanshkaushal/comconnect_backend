const mongoose = require("mongoose");

const Connection = async (username, password) => {
    const URL = `mongodb+srv://${username}:${password}@cluster0.t7rpzk9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
        socketTimeoutMS: 60000, // Increased socket timeout to 60 seconds
        bufferCommands: false, // Disable Mongoose's internal buffering
        autoIndex: true, // Auto-indexing for performance improvement
    };

    try {
        await mongoose.connect(URL, options);
        console.log('Database Connected Successfully');
    } catch (error) {
        console.error('Database Connection Error: ', error.message);
    }
};

module.exports = Connection;