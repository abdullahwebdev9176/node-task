const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

const client =  new MongoClient(uri)

connectDB = async () => {
    try {

        await client.connect();

        console.log('MongoDB Connected Successfully');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connectDB;