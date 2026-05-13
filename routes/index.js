var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
	res.json({ result: true, message: 'Tickethack API' });
});

module.exports = router;