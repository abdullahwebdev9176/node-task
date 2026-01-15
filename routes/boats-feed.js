const { default: axios, all } = require('axios');
const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');


router.get('/boats-feed', async (req, res) => {

    try {
        
        const response = await axios.get('https://callersiq.com/cali_marine_huntington_beach_xml_feed')

        const xmlData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false });

        const result = await parser.parseStringPromise(xmlData);

        const boats = result?.inventory.item || [];

        console.log(boats);

        for(let boat of boats){

            const boatTitle =  `${boat.year} ${boat.make} ${boat.model}`;

            const all_images = Object.values(boat.inventory_images ? boat.inventory_images : {});

            const thumbnail_image = all_images.length > 0 ? all_images[0] : null;
            

            const boatData = {
                id: boat.id,
                title: boatTitle,
                description: boat.description,
                make: boat.make,
                model: boat.model,
                year: boat.year,
                price: boat.price,
                length: boat.length,
                condition: boat.condition,
                location: boat.location,
                images: boat.images?.image || [],
                sale_status: boat.sale_status,
                beam: boat.beam,
                fuel_type: boat.fuel_type,
                stock_number: boat.stocknumber,
                engine_model: boat.enginemodel,
                engine_hours: boat.enginehours,
                banner: boat.banner,
                boat_images: all_images,
                thumbnail_image: thumbnail_image
            }
        }

        res.json({ boats });

    } catch (error) {

    }
});

module.exports = router