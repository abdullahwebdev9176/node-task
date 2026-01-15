const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri)
let db;

connectDB = async () => {
    try {

        await client.connect();
        db = client.db();
        console.log('MongoDB Connected Successfully');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
}

module.exports = { connectDB, getDB };