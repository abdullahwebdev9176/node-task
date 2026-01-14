const { default: axios } = require('axios');
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

        res.json({ boats });

    } catch (error) {

    }
});

module.exports = router