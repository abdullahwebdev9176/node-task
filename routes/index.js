const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { getStyles } = require('../public/js/common');
const { ObjectId } = require('mongodb');

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

    const brands = [...new Set(boats.map(boat => boat.make))];
    const condition = [...new Set(boats.map(boat => boat.condition))];


    const styles = getStyles();


    res.render('boats', {
        title: 'Boats For Sale',
        boats: boats,
        brands: brands,
        condition: condition,
        style: styles
    });
})

router.get('/boat-details/:id', async (req, res) => {
    const db = getDB();

    const result = await db.collection('boats').findOne({
        _id: new ObjectId(req.params.id)
    });

    console.log(result);

    const styles = getStyles();

    res.render('boat-details', {
        title: 'Boat Details',
        result: result,
        styles
    });
});




module.exports = router;