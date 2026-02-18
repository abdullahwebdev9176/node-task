const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { getStyles, getJquery, jQueryUIScript, jQueryUIStyle, getFilter } = require('../helpers/assetHelper');

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

    const { condition, brands, models, lengthRange } = req.body;

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
    if (lengthRange && lengthRange.min !== undefined && lengthRange.max !== undefined) {
        query.length = {
            $gte: lengthRange.min.toString(),
            $lte: lengthRange.max.toString()
        };
    }

    const boats = await db.collection('boats').find(query).toArray();

    console.log(boats);

    res.json({
        boats: boats
    });

})

router.get('/load-more-boats', async (req, res) => {
    const db = getDB();

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 3;

    const boats = await db.collection('boats').find({}).skip(skip).limit(limit).toArray();
    res.json({
        boats: boats
    });
})

router.get('/boats-pagination', async (req, res) => {
    const db = getDB();

    const page = parseInt(req.query.page || 1);
    const limit = 3;
    const skip = (page - 1) * limit;

    console.log('skip boats', skip);

    const boats = await db.collection('boats').find({}).skip(skip).limit(limit).toArray();
    const totalsBoats = await db.collection('boats').find().count();
    console.log('total boats', totalsBoats);

    const totalPages = Math.ceil(totalsBoats / limit);

    console.log('total pages', totalPages);

    res.json({
        boats: boats,
        totalsBoats: totalsBoats,
        page: page,
        skip: skip,
        totalPages: totalPages
    });
})

router.get('/boats-for-sale', async (req, res) => {

    const db = getDB();

    const results = await db.collection('boats').find().limit(3).toArray();
    const boats = await db.collection('boats').find().toArray();

    const brands = [...new Set(boats.map(boat => boat.make.trim()))];
    const condition = [...new Set(boats.map(boat => boat.condition.trim()))];
    const models = [...new Set(boats.map(boat => boat.model.trim()))];
    const length = [...new Set(boats.map(boat => boat.length.trim()))];

    const minLength = Math.min(...length)
    const maxLength = Math.max(...length)

    console.log('min length', minLength);
    console.log('max length', maxLength);

    const styles = [...jQueryUIStyle(), ...getStyles()];
    const scripts = [...getJquery(), ...jQueryUIScript(), ...getFilter()];


    res.render('boats', {
        title: 'Boats For Sale',
        boats: results,
        brands: brands,
        condition: condition,
        models: models,
        minLength,
        maxLength,
        style: styles,
        scripts: scripts
    });
})

router.get('/new-boats-for-sale', async (req, res) => {

    const db = getDB();

    const boats = await db.collection('boats').find().limit(3).toArray();

    const brands = [...new Set(boats.map(boat => boat.make.trim()))];
    const condition = [...new Set(boats.map(boat => boat.condition.trim()))];
    const models = [...new Set(boats.map(boat => boat.model.trim()))];
    const length = [...new Set(boats.map(boat => boat.length.trim()))];

    const minLength = Math.min(...length)
    const maxLength = Math.max(...length)

    console.log('min length', minLength);
    console.log('max length', maxLength);

    const styles = [...jQueryUIStyle(), ...getStyles()];
    const scripts = [...getJquery(), ...jQueryUIScript(), ...getFilter()];


    res.render('new-boats', {
        title: 'New Boats For Sale',
        boats: boats,
        brands: brands,
        condition: condition,
        models: models,
        minLength,
        maxLength,
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