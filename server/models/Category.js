const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');
const { slugify } = require('../utils/Helper');
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constant/Status');

const categorySchema = mongoose.Schema({
  id: Number,
  name: {
    type: String,
    required: true,
    trim: true
  },
  alias: String,
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Category',
    index: true
  },
  ancestors: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true
    },
    name: String,
    slug: String
  }],
  games: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Games',
      index: true
    },
    name: String,
    slug: {
      type: String,
      index: true
    },
    url: String,
    image: String,
    isNewGame: Boolean,
    isMobile: Boolean,
    totalPlayed: Number,
    ownGame: Boolean,
    ratings: Number,
    manualRating: Number,
    likes: Number,
    status: {
      type: Number,
      enum: [0, 1],
      default: 1
    },
    addDate: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tags',
    }
  }],
  status: {
    type: Number,
    enum: [STATUS_INACTIVE, STATUS_ACTIVE],
    default: STATUS_ACTIVE
  },
  isMainMenu: {
    type: Boolean,
    default: false
  },
  isFeature: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  icon: String,
  metaTitle: String,
  metaDesc: String,
  metaKeyword: String,
  description: String,
}, {
  timestamps: true
});

categorySchema.pre('save', async function (next) {
  this.slug = slugify(this.name);
  next();
});

categorySchema.methods.buildAncestors = async function (parentId, callback) {
  if (!parentId) {
    return [];
  }

  const category = this;
  Category.findOne({ '_id': parentId }, {
    'name': 1,
    'slug': 1,
    'ancestors': 1
  }).exec()
    .then(parentCategory => {
      if (!parentCategory) {
        return callback(null, []);
      }
      const { _id, name, slug } = parentCategory;
      category.ancestors = [...parentCategory.ancestors, { _id, name, slug }];

      category.save((error, result) => {
        if (error) {
          callback(error);
        }
        callback(null, category);
      });
    });
};

//Need to refactor below code

categorySchema.statics.getCategoryById = async (categoryId) => {
  let condition = { status: STATUS_ACTIVE };
  condition._id = categoryId
  try {
    return await Category.findOne(condition, { games: { $slice: 1 } }).exec();
  } catch (error) {
    console.log(error)
  }
}
//Static methods
categorySchema.statics.getActiveCategory = async ({ isMainMenu, parent, id, slug, order, limit = 10}) => {
  let condition = { status: STATUS_ACTIVE };
  if (parent) {
    condition.parent = mongoose.Types.ObjectId.isValid(parent) ? parent : null;
  }
  if(isMainMenu) {
    condition.isMainMenu = isMainMenu ? true : false
  }
  if(id) {
    condition.id = { $lt: 100}
  }
  if (slug) {
    condition.slug = slug;
  }

  const sort = {}
  if (order) {
    const parts = order.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  limit = parseInt(limit);
  if(limit>100){
    limit = 10
  }

  try {
    const result = await Category.find(condition, { games: { $slice: limit } })
      .sort(sort)
      .limit(limit)
      .exec();

    return result;
  } catch (error) {
    console.log(error)
  }
}

categorySchema.statics.getCategoryBySlug = async ({ slug }) => {
  try {
    const result = await Category.find(
      { $and: [{ "slug": { $in: slug } }, { "status": STATUS_ACTIVE }] },
      { games: {$slice: 20}}
    )
    return result;
  } catch (error) {
    console.log(error)
  }
}

//Home page category
categorySchema.statics.sortCategoryGame = (category) => category.map(item => {
  item.games = sortByDate(item.games, 'addDate');
  return item;
});

//sort by date
const sortByDate = (item, field) => {
  return _.sortBy(item, (game) => new moment(game[field])).reverse();
};

categorySchema.statics.getActiveCategoryGames = async ({ parent, slug }) => {
  let condition = { status: STATUS_ACTIVE };
  if (parent) {
    condition.parent = mongoose.Types.ObjectId.isValid(parent) ? parent : null;
  }
  if (slug) {
    condition.slug = slug;
  }

  try {
    const result = await Category.find(condition).exec();
    return result;
  } catch (error) {
    console.log(error)
  }
}

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;