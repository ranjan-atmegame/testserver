const express = require('express');
// const auth = require('../middleware/auth');
const {
    saveCategory,
    listCategory,
    findCategory,
    relatedCategory,
    listMenu,
    categorySitemap } = require('../controllers/Category');
const router = new express.Router();

//Routes
router.get('/category/related/:id', relatedCategory);
router.get('/category/sitemap', categorySitemap);

// router.post('/category', auth, saveCategory);
router.post('/category', saveCategory);
router.get('/category', listCategory);
router.get('/category/:id', findCategory);
// router.put('category/:id', auth, updateCategory);
// router.delete('/category/:id', auth, deleteCategory);

router.get('/menu', listMenu);

module.exports = router;