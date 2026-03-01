const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const settings = require('../config/setting.json');
const { getStyles, getJquery, jQueryUIScript, jQueryUIStyle, getFilter } = require('../helpers/assetHelper');
const { inventory_urls, filter_queries_data, boats_based_on_types, getFilteredBoats } = require('../helpers/utils');


router.get('/', (req, res) => {

    const name = 'Muhammad Abdullah';
    const styles = getStyles();

    res.render('home', {
        title: 'Home Page',
        name: name,
        style: styles,
        scripts: getJquery()
    });
})

router.get('/:page', async(req, res) => {

    const page = req.params.page;

    const allowedPages = inventory_urls;
    
    if (!allowedPages.includes(page)) {
        return renderNotFoundPage(req, res);
    }

    const db = getDB();

    const typeQuery = boats_based_on_types(page);

    // console.log('type query', typeQuery);

    const results = await db.collection('boats').find(typeQuery).limit(settings.boat_limit).toArray();
    const boats = await db.collection('boats').find(typeQuery).toArray();

    const { brands, condition, models, minLength, maxLength, series, totalBoats, minYear, maxYear } = await getFilteredBoats(boats);

    console.log('year', minYear, 'max year', maxYear);

    const totalPages = Math.ceil(totalBoats / settings.boat_limit);
    const currentPage = parseInt(page) || 1;

    const styles = [...jQueryUIStyle(), ...getStyles()];
    const scripts = [...getJquery(), ...jQueryUIScript(), ...getFilter()];


    res.render('boats', {
        title: 'Boats For Sale',
        boats: results,
        totalBoats: totalBoats,
        brands: brands,
        condition: condition,
        models: models,
        series: series,
        minLength: minLength,
        maxLength: maxLength,
        minYear: minYear,
        maxYear: maxYear,
        pageUrl: page,
        totalPages: totalPages,
        currentPage: currentPage,
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

router.post('/boat-search', async (req, res) => {
    const db = getDB();

    console.log('query params', req.body);

    const { searchValue, sortByValue } = req.body;

    let query = {};
    let sorting = {};

    if(searchValue){
        query.$or = [
            { title: { $regex: searchValue, $options: 'i' } }
        ];
    }

    switch (sortByValue) {

        case 'price_low_high':
            sorting = { price: 1 };
            break;
        case 'price_high_low':
            sorting = { price: -1 };
            break;
        case 'length_low_high':
            sorting = { length: 1 };
            break;
        case 'length_high_low':
            sorting = { length: -1 };
            break;
        default:
            sorting = { createdAt: -1 };
    }


    const boats = await db.collection('boats').find(query).sort(sorting).toArray();

    res.json({
        boats: boats
    })
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

const renderNotFoundPage = (req, res) => {
    res.render('error-page', {
        title: 'Page Not Found'
    });
}

module.exports = router;