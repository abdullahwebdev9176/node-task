const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{

    const name = 'Muhammad Abdullah';

    res.render('home', {
        title: 'Home Page',
        name: name
    });
})


module.exports = router;