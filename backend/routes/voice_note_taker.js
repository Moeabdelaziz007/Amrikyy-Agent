const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.send('Voice Note Taker routes are working!');
});

// TODO: Add more routes for creating, getting, and organizing notes.

module.exports = router;
