const express = require('express');
const router = express.Router();

// 🔽 TUS RUTAS (las que pegaste)
router.post('/post', (req, res) => {
    res.send('Post API')
});

router.get('/getAll', (req, res) => {
    res.send('Get All API')
});

router.get('/getOne/:id', (req, res) => {
    res.send(req.params.id)
})

router.patch('/update/:id', (req, res) => {
    res.send('Update by ID API')
});

router.delete('/delete/:id', (req, res) => {
    res.send('Delete by ID API')
});

// 🔽 ESTO ES OBLIGATORIO
module.exports = router;
