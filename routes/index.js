const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const settings = require('../config/setting.json');
const { getStyles, getJquery, jQueryUIScript, jQueryUIStyle, getFilter } = require('../helpers/assetHelper');
const { inventory_urls, filter_queries_data } = require('../helpers/utils');


router.get('/', (req, res) => {

    const name = 'Muhammad Abdullah';
    const styles = getStyles();

    res.render('home', {
        title: 'Home Page',
        name: name,
        style: styles
    });
})

router.get('/:page', async(req, res) => {

    const page = req.params.page;

    const allowedPages = inventory_urls;
    
    if (!allowedPages.includes(page)) {
        return renderNotFoundPage(req, res);
    }

    const db = getDB();

    const results = await db.collection('boats').find().limit(settings.boat_limit).toArray();
    const boats = await db.collection('boats').find().toArray();

    const brands = [...new Set(boats.map(boat => boat.make.trim()))];
    const condition = [...new Set(boats.map(boat => boat.condition.trim()))];
    const models = [...new Set(boats.map(boat => boat.model.trim()))];
    const length = [...new Set(boats.map(boat => boat.length.trim()))];

    const minLength = Math.min(...length)
    const maxLength = Math.max(...length)

    const totalBoats = boats.length;

    // console.log('min length', minLength);
    // console.log('max length', maxLength);

    const styles = [...jQueryUIStyle(), ...getStyles()];
    const scripts = [...getJquery(), ...jQueryUIScript(), ...getFilter()];


    res.render('boats', {
        title: 'Boats For Sale',
        boats: results,
        totalBoats: totalBoats,
        brands: brands,
        condition: condition,
        models: models,
        minLength,
        maxLength,
        style: styles,
        scripts: scripts
    });

})

router.post('/get-boats', async (req, res) => {
    const db = getDB();

    console.log(req.body);

    const query = filter_queries_data(req.body);

    const boats = await db.collection('boats').find(query).limit(settings.boat_limit).toArray();
    const filterData = await db.collection('boats').find(query).toArray();

    // console.log('boats', boats.length);
    console.log('filterData', filterData.length);

    res.json({
        boats: boats,
        filterData: filterData
    });

})

router.post('/load-more-boats', async (req, res) => {
    const db = getDB();

    console.log('query params', req.body);

    const { skip, limit } = req.body;

    const skipBoat = parseInt(skip) || 0;
    const limitBoat = parseInt(limit) || settings.boat_limit;

    let query = filter_queries_data(req.body);

    const boats = await db.collection('boats').find(query).skip(skipBoat).limit(limitBoat).toArray();
    res.json({
        boats: boats
    });
})

router.post('/boat-search', async (req, res) => {
    const db = getDB();

    console.log('query params', req.body);

    const { searchValue } = req.body;

    const boats = await db.collection('boats').find({
        $or: [
            { title: { $regex: searchValue, $options: 'i' } }
        ]
    }).toArray();

    res.json({
        boats: boats
    })
})

// router.post('/boats-pagination', async (req, res) => {
//     const db = getDB();

//     const { condition, brands, models, lengthRange, page } = req.body;

//     const currentPage = parseInt(page || 1);
//     const limit = settings.boat_limit || 12;
//     const skip = (currentPage - 1) * limit;

//     let query = {};

//     if (condition.length > 0) {
//         query.condition = { $in: condition };
//     }
//     if (brands.length > 0) {
//         query.make = { $in: brands };
//     }
//     if (models.length > 0) {
//         query.model = { $in: models };
//     }
    
//     if (lengthRange && lengthRange.min !== undefined && lengthRange.max !== undefined) {
//         query.length = {
//             $gte: lengthRange.min.toString(),
//             $lte: lengthRange.max.toString(),

//         };
//     }

//     // console.log('skip boats', query);

//     const boats = await db.collection('boats').find(query).skip(skip).limit(limit).toArray();
//     const totalsBoats = await db.collection('boats').find({}).count();

//     console.log('totalsBoats', totalsBoats);

//     const totalPages = Math.ceil(totalsBoats / limit);

//     console.log('result', boats.length);
//     console.log('total pages', totalPages);

//     res.json({
//         boats: boats,
//         totalsBoats: totalsBoats,
//         page: currentPage,
//         skip: skip,
//         totalPages: totalPages
//     });
// })

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

const renderNotFoundPage = (req, res) => {
    res.render('error-page', {
        title: 'Page Not Found'
    });
}

module.exports = router;