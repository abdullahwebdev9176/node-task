const express = require('express');
const router = express.Router();
const { runFeed } = require('../routes/boats-feed');
const cron = require('node-cron');

cron.schedule('*/5 * * * *', async () => {
    console.log('Running boats feed cron job every 5 minutes');
    const result = await runFeed();
    console.log('Cron job completed. Boats inserted:', result.insertedData.insertedCount, 'Sold boats inserted:', result.insertedSoldBoatsData.insertedCount);
});



module.exports = router;