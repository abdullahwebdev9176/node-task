const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { getStyles } = require('../public/js/common');

router.get('/', (req, res) => {

    const name = 'Muhammad Abdullah';
    const styles = getStyles();

    res.render('home', {
        title: 'Home Page',
        name: name,
        style: styles
    });
})

router.get('/boats-for-sale', async (req, res) => {

    const db = getDB();

    const boats = await db.collection('boats').find().toArray();

    const styles = getStyles();

    // console.log(boats);

    res.render('boats', {
        title: 'Boats For Sale',
        boats: boats,
        style: styles
    });
})


module.exports = router;