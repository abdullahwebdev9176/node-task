const settings = require('../config/setting.json');

const inventory_urls = ['boats-for-sale', 'new-boats-for-sale', 'used-boats-for-sale'];

const filter_queries_data = (filterParams) => {

    const { condition, brands, models, lengthRange, series, skip, limit } = filterParams;

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
    if (series.length > 0) {
        query.series = { $in: series };
    }
    if (lengthRange && lengthRange.min !== undefined && lengthRange.max !== undefined) {
        query.length = {
            $gte: lengthRange.min.toString(),
            $lte: lengthRange.max.toString()
        };
    }

    return query;
};

const boats_based_on_types = (type) => {
    switch (type) {
        case 'new-boats-for-sale':
            return { condition: 'New Model' };
        case 'used-boats-for-sale':
            return { condition: 'Pre-Owned' };
        default:
            return {};
    }
};

const getFilteredBoats = async (boats) => {
    
    const brands = [...new Set(boats.map(boat => boat.make.trim()))];
    const condition = [...new Set(boats.map(boat => boat.condition.trim()))];
    const models = [...new Set(boats.map(boat => boat.model.trim()))];
    const length = [...new Set(boats.map(boat => boat.length.trim()))];
    const year = [...new Set(boats.map(boat => boat.year.trim()))];
    const series = [...new Set(boats.map(boat => boat.series.trim()).filter(series => series !== ''))];

    const minLength = Math.min(...length)
    const maxLength = Math.max(...length)

    const minYear = Math.min(...year)
    const maxYear = Math.max(...year)

    const totalBoats = boats.length;

    return {
        brands,
        condition,
        models,
        length,
        series,
        minLength,
        maxLength,
        minYear,
        maxYear,
        totalBoats
    };
}

module.exports = {
    inventory_urls,
    filter_queries_data,
    boats_based_on_types,
    getFilteredBoats
};