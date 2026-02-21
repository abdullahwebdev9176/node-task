
const inventory_urls = ['boats-for-sale', 'new-boats-for-sale', 'used-boats-for-sale'];

const filter_queries_data = (filterParams) => {

    const { condition, brands, models, lengthRange, skip, limit } = filterParams;

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
    return query;
};

module.exports = {
    inventory_urls,
    filter_queries_data
};