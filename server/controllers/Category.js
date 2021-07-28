const Category = require('../models/Category');
const { STATUS_ACTIVE } = require('../constant/Status');
const _ = require('lodash')

const saveCategory = async (req, res) => {
  let categoryJson = buildCategory(req.body);
  let category = new Category(categoryJson)
  let parent = req.body.parent ? req.body.parent : null;

  try {
    await category.save();
    await category.buildAncestors(parent);
    res.status(201).send({ category });
  } catch (error) {
    res.status(500).send(error);
  }
};

const listCategory = async (req, res) => {
  try {
    let category = await Category.getActiveCategory(req.query);
    res.send({ "status": "success", "result": category });
  } catch (error) {
    res.status(500).send(error);
  }
};

const categorySitemap = async (req, res) => {
  try {
    let categoryList = await Category.find({ parent: null, status: STATUS_ACTIVE }).select({ _id: true, name: true, slug: true, icon: true }).sort({ order: 1 });
    if (!categoryList) {
      return res.status(404).send();
    }

    const categoryArray = categoryList.map(async category => {
      let subCategory = await Category.find({ parent: category._id, status: STATUS_ACTIVE }).select({ _id: true, name: true, slug: true, icon: true }).sort({ order: 1 });
      const { _id, name, slug, icon } = category;
      return {
        _id,
        name,
        slug,
        icon,
        subCategory
      }
    })

    const result = await Promise.all(categoryArray)
    res.send({ "status": "success", "result": result });
  } catch (error) {
    res.status(500).send(error);
  }
}

const listMenu = async (req, res) => {
  try {
    let mainMenu = await Category.getActiveCategory(req.query);
    let allMenu = await Category.getActiveCategory({ order: 'name: 1', limit: 70 });
    res.send({ "status": "success", "result": { mainMenu, allMenu } });
  } catch (error) {
    res.status(500).send(error);
  }
};

const relatedCategory = async (req, res) => {
  try {
    const { id } = req.params
    let category = await Category.findOne({ _id: id, status: STATUS_ACTIVE }, { games: { $slice: 0 } })

    let condition = { status: STATUS_ACTIVE, parent: category._id }
    let parentCategory = {}
    //getting parent category
    if (category.parent) {
      condition = { ...condition, parent: category.parent }
      parentCategory = await Category.findOne({ _id: category.parent }, { games: { $slice: 0 } })
    }

    let result = await Category.find(
      condition,
      { games: { $slice: 0 } }
    ).sort({ id: 1 })

    if (category.parent && !category.isFeature) {
      result = result.filter(cat => cat._id != id)
      result = [parentCategory, ...result]
    }

    res.send({ "status": "success", result });
  } catch (error) {
    res.status(500).send(error);
  }
};

const buildCategory = (data) => {
  let parent = data.parent ? data.parent : null;

  return {
    name: data.name,
    parent,
    status: data.status,
    isFeature: data.isFeature,
    order: data.order,
    icon: data.icon,
    metaTitle: data.metaTitle,
    metaDesc: data.metaDesc,
    metaKeyword: data.metaKeyword,
    description: data.description,
  }
}

const findCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });

    if (!category) {
      return res.status(404).send();
    }
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateCategory = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'slug', 'parent', 'ancestors', 'status', 'isFeature', 'icon', 'metaTitle', 'metaDesc', 'metaKeyword', 'description'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const category = await Category.findOne({ _id: req.params.id });
    if (!category) {
      return res.status(404).send();
    }

    updates.forEach((update) => category[update] = req.body[update]);
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id });
    if (!category) {
      return res.status(404).send();
    }

    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};

const findCategoryWithSub = async (req, res) => {
  try {
    let category = await Category.getCategoryWithSubcateogry(req.query);
    res.send({ "status": "success", "result": category });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  saveCategory,
  listCategory,
  findCategory,
  updateCategory,
  deleteCategory,
  relatedCategory,
  listMenu,
  categorySitemap
}
