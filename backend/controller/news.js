const News = require("../model/news");
const newsCategory = require("../model/newsCategory")
const ServiceCategory =require("../model/serviceCategory")
const path = require('path')
const fs = require('fs')


const insertNews = async (req, res) => {
  try {

    const { title, details, status, alt,imgtitle, slug, metatitle, metadescription, metakeywords, metacanonical, metalanguage, metaschema, otherMeta, postedBy, date, categories, subcategories, subSubcategories,servicecategories, servicesubcategories, servicesubSubcategories, url, priority, changeFreq } = req.body;
    const photo = req.files['photo'] ? req.files['photo'].map(file => file.filename) : [];

    const news = new News({
      title,
      details,
      photo,
      imgtitle,
      status,
      postedBy,
      metatitle,
      metadescription,
      metakeywords,
      metacanonical,
      metalanguage,
      metaschema,
      otherMeta,
      slug,
      url,
      changeFreq,
      priority,
      status,
      alt,
      date,
      categories,
      subcategories,
      subSubcategories,
       servicecategories,
       servicesubcategories,
       servicesubSubcategories
    });

    await news.save();
    res.send(news);
  } catch (err) {
    console.error("Error inserting news:", err);
    res.status(400).send(err);
  }
}

const getNews = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 5;
    const count = await News.countDocuments();
    const news = await News.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const newsWithCategoryName = await Promise.all(news.map(async (news) => {
      const category = await newsCategory.findOne({ 'slug': news.categories });
      const categoryName = category ? category.category : 'Uncategorized';
      return {
        ...news.toJSON(),
        categoryName
      };
    }));
    res.status(200).json({
      data: newsWithCategoryName,
      total: count,
      currentPage: page,
      hasNextPage: count > page * limit
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};

const searchNews = async (req, res) => {
  try {
    let { page = 1, limit = 5, search = '' } = req.query;
    page = Math.max(1, parseInt(page) || 1); // Ensure page is at least 1
    limit = Math.min(100, Math.max(1, parseInt(limit) || 5)); // Limit between 1 and 100
    search = search.trim();
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters

    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: escapedSearch, $options: 'i' } },
            { postedBy: { $regex: escapedSearch, $options: 'i' } },
          ],
        }
      : {};

    const count = await News.countDocuments(searchQuery);
    const news = await News.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const newsWithCategoryName = await Promise.all(news.map(async (newsItem) => {
      const category = await newsCategory.findOne({ 'slug': newsItem.categories });
      if (!category) {
        console.warn(`Category not found for slug: ${newsItem.categories}`);
      }
      const categoryName = category ? category.category : 'Uncategorized';
      return {
        ...newsItem.toJSON(),
        categoryName,
      };
    }));

    res.status(200).json({
      data: newsWithCategoryName,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      hasNextPage: count > page * limit,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Error searching news:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};

const getNewsFront = async (req, res) => {
  try {
    // Fetch only active news and sort by date in descending order to get the latest news first
    const news = await News.find({ status: 'active' }).sort({ createdAt: -1 });

    // Map over the news and fetch the associated category and service category names
    const newsWithCategoryAndService = await Promise.all(news.map(async (newsItem) => {
      // Fetch news category name
      const category = await newsCategory.findOne({ 'slug': newsItem.categories });
      const categoryName = category ? category.category : 'Uncategorized';

      // Fetch service category name
      const serviceCategory = await ServiceCategory.findOne({ 'slug': newsItem.servicecategories });
      const serviceCategoryName = serviceCategory ? serviceCategory.category : 'No Service Category';

      return {
        ...newsItem.toJSON(),
        categoryName,
        serviceCategoryName
      };
    }));

    // Return the sorted news with category and service category names
    res.status(200).json({
      data: newsWithCategoryAndService,
      total: news.length
    });
  } catch (error) {
    console.error("Error retrieving news:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};

// get single details of the blog 
const getNewsBySlug = async (req, res) => {
  try {
    // Extract the slug from the request parameters
    const { slug } = req.params;
    console.log(slug)
    // Fetch the news item by slug
    const newsItem = await News.findOne({ slug: slug });

    // Check if the news item exists
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }

    // Fetch the associated category name
    const category = await newsCategory.findOne({ 'slug': newsItem.categories });
    const categoryName = category ? category.category : 'Uncategorized';

    // Fetch the associated service category name
    const serviceCategory = await ServiceCategory.findOne({ 'slug': newsItem.servicecategories });
    const serviceCategoryName = serviceCategory ? serviceCategory.category : 'No Service Category';

    // Return the news item with category and service category names
    res.status(200).json({
      ...newsItem.toJSON(),
      categoryName,
      serviceCategoryName
    });
  } catch (error) {
    console.error("Error retrieving news:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};




const updateNews = async (req, res) => {
  const { slugs } = req.query;
  const updateFields = req.body;

  try {
    // Fetch the existing news item to get its current photos
    const existingNews = await News.findOne({slug:slugs});

    if (!existingNews) {
      return res.status(404).json({ message: 'News item not found' });
    }

    // Process new uploaded photos
    if (req.files && req.files['photo'] && req.files['photo'].length > 0) {
      const newPhotoPaths = req.files['photo'].map(file => file.filename); // Using filename to get the stored file names
      updateFields.photo = [...existingNews.photo, ...newPhotoPaths];
    } else {
      updateFields.photo = existingNews.photo; // Keep existing photos if no new photos are uploaded
    }

    const updatedNews = await News.findOneAndUpdate(
      { slug: slugs },
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedNews);
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const deleteNews = async (req, res) => {
  try {
    const { slugs } = req.query;

    const news = await News.findOne({slug:slugs});

    news.photo.forEach(filename => {
      const filePath = path.join(__dirname, '../images', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn(`File not found: ${filename}`);
      }
    });

    const deletedNews = await News.findOneAndDelete({slug:slugs});

    if (!deletedNews) {
      return res.status(404).send({ message: 'News not found' });
    }

    res.send({ message: "News deleted successfully" }).status(200);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
}


const getNewsById = async (req, res) => {
  try {
    const { slugs} = req.query;

    const news = await News.findOne({slug:slugs});
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.status(200).json({ data: news });
  } catch (error) {

    res.status(500).json({ message: "Server error" });
  }
}

const getLatestBlogs = async (req, res) => {
  try {
    const { slug } = req.query;
    let blogs;

    // Check if slug is provided
    if (slug) {
      // Fetch blogs filtered by service category (slug) and active status
      blogs = await News.find({ servicecategories: slug, status: 'active' })
        .sort({ date: -1 })  // Sort by date in descending order
        .limit(5);           // Limit to the latest 5 blogs
    } else {
      // If no slug is provided, fetch all active blogs
      blogs = await News.find({ status: 'active' })
        .sort({ date: -1 })  // Sort by date in descending order
        .limit(5);           // Limit to the latest 5 blogs
    }

    res.status(200).json({
      blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const updateBlogVisits = async (req, res) => {
  const { slug } = req.query;
  try {
      const blog = await News.findOneAndUpdate(
          { slug },
          { $inc: { visits: 1 } },
          { new: true }
      );
      if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json({ visits: blog.visits });
  } catch (error) {
      res.status(500).json({ message: 'Error updating visits', error });
  }
};

const countNews = async (req, res) => {
  try {
    const count = await News.countDocuments();
    res.status(200).json({ total: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error counting services' });
  }
};

const deletePhotoAndAltText = async (req, res) => {

  const { slugs, imageFilename, index } = req.params;


  try {

    const news = await News.findOne({slug:slugs});

    if (!news) {
      return res.status(404).json({ message: 'news not found' });
    }

    // Remove the photo and its alt text
    news.photo = news.photo.filter(photo => photo !== imageFilename);
    news.alt.splice(index, 1);
    news.imgtitle.splice(index, 1);

    await news.save();
    
    const filePath = path.join(__dirname, '..', 'images', imageFilename);

    // Check if the file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Photo and alt text deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo and alt text:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCategoryNews = async (req, res) => {
  const { categoryId } = req.query;

  try {
    const news = await News.find({ categories: categoryId });

    if (news.length === 0) {
      return res.status(404).json({ message: 'No news found for this category' });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getSubcategoryNews = async (req, res) => {
  const { subcategoryId } = req.query;

  try {
    const news = await News.find({ subcategories: subcategoryId });

    if (news.length === 0) {
      return res.status(404).json({ message: 'No news found for this subcategory' });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getSubSubcategoryNews = async (req, res) => {
  const { subSubcategoryId } = req.query;

  try {
    const news = await News.find({ subSubcategories: subSubcategoryId });

    if (news.length === 0) {
      return res.status(404).json({ message: 'No news found for this sub-subcategory' });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const fetchUrlPriorityFreq = async (req, res) => {
  try {
    // Get  newsId from request parameters
    const news = await News.find({}).select('_id url priority changeFreq lastmod');
    if (!news) {
      return res.status(404).json({ error: "news not found" });
    }
    res.status(200).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


const fetchUrlmeta = async (req, res) => {
  try {
    // Get newsId from request parameters
    const news = await News.find({}).select('_id url metatitle metadescription metakeywords metacanonical metalanguage metaschema otherMeta');
    if (!news) {
      return res.status(404).json({ error: "news not found" });
    }
    res.status(200).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}


const editUrlPriorityFreq = async (req, res) => {
  try {
    const { id } = req.query; // Get productId from request parameters
    const { url, priority, changeFreq } = req.body;

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { url, priority, changeFreq, lastmod: Date.now() },
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const editUrlmeta = async (req, res) => {
  try {
    const { id } = req.query; // Get newsId from request parameters
    const { url, metatitle, metadescription, metakeywords, metacanonical, metalanguage, metaschema, otherMeta } = req.body;

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { url, metatitle, metadescription, metakeywords, metacanonical, metalanguage, metaschema, otherMeta },
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ error: "news not found" });
    }

    res.status(200).json(updatedNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// const deleteUrlPriorityFreq = async (req, res) => {
//   try {
//     const { id } = req.query; // Get productId from request parameters

//     const updatedNews = await News.findByIdAndUpdate(
//       id,
//       { $unset: { url: "", priority: "", changeFreq: "" } },
//       { new: true }
//     );

//     if (!updatedNews) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.status(200).json({ message: "Url, priority, and freq deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const fetchUrlPriorityFreqById = async (req, res) => {
  try {
    const { id } = req.query; // Extract id from query parameters

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    // Find the news by ID and select specific fields
    const news = await News.findById(id).select('url priority changeFreq');

    if (!news) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const fetchUrlmetaById = async (req, res) => {
  try {
    const { id } = req.query; // Extract id from query parameters

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    // Find the news by ID and select specific fields
    const news = await News.findById(id).select('url metatitle metadescription metakeywords metacanonical metalanguage metaschema otherMeta');

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


const getAllNews = async (req, res) => {
  try {
  
    const count = await News.countDocuments();
    const news = await News.find()
      
    const newsWithCategoryName = await Promise.all(news.map(async (news) => {
      const category = await newsCategory.findOne({ 'slug': news.categories });
      const categoryName = category ? category.category : 'Uncategorized';
      return {
        ...news.toJSON(),
        categoryName
      };
    }));
    res.status(200).json({
      data: newsWithCategoryName,
     
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};


module.exports = { searchNews, updateBlogVisits,getAllNews,getNewsFront,getNewsBySlug,insertNews, getNews,getLatestBlogs, updateNews, deleteNews, getNewsById, countNews, deletePhotoAndAltText, getCategoryNews, getSubcategoryNews, getSubSubcategoryNews, fetchUrlPriorityFreq, editUrlPriorityFreq, fetchUrlPriorityFreqById, fetchUrlmeta, editUrlmeta, fetchUrlmetaById };
