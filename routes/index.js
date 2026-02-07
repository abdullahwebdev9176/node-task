const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { getStyles, jQueryUIStyle, jQueryUIScript } = require('../public/assets/js/assetHelper');

router.get('/', (req, res) => {

    const name = 'Muhammad Abdullah';
    const styles = getStyles();

    res.render('home', {
        title: 'Home Page',
        name: name,
        style: styles
    });
})

router.post('/get-boats', async (req, res) => {
    const db = getDB();

    console.log(req.body);

    const { condition, brands, models } = req.body;

    let query = {};
    if (condition.length > 0) {
        query.condition = { $in: condition };
    }
    if (brands.length > 0) {
        query.make = { $in: brands };
    }
    if (models.length > 0) {
        query.model = { $in: models };
    }
    const boats = await db.collection('boats').find(query).toArray();

    console.log(boats);

    res.json({
        boats: boats
    });

})

router.get('/boats-for-sale', async (req, res) => {

    const db = getDB();

    const boats = await db.collection('boats').find().toArray();

    console.log(boats);

    const brands = [...new Set(boats.map(boat => boat.make.trim()))];
    const condition = [...new Set(boats.map(boat => boat.condition.trim()))];
    const models = [...new Set(boats.map(boat => boat.model.trim()))];

    const styles = [...getStyles(), ...jQueryUIStyle()];
    const scripts = [...jQueryUIScript()];


    res.render('boats', {
        title: 'Boats For Sale',
        boats: boats,
        brands: brands,
        condition: condition,
        models: models,
        style: styles,
        scripts: scripts
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