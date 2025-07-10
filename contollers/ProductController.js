const Product = require('../models/Product');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const { cloudinary } = require('../utils/fileUploader');

// @desc    Get all products (optionally filtered by exhibitor)
// @route   GET /api/products
// @route   GET /api/exhibitors/:exhibitorId/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.exhibitorId) {
    // If nested route is used, filter by exhibitor
    query = Product.find({ exhibitor: req.params.exhibitorId });
  } else {
    // If base route is used, get all products and populate exhibitor info
    query = Product.find().populate({
      path: 'exhibitor',
      select: 'name boothNumber'
    });
  }

  const products = await query;

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'exhibitor',
    select: 'name boothNumber email'
  });

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: product });
});


// @desc    Create a new product (with image uploads)
// @route   POST /api/exhibitors/:exhibitorId/products
// @access  Private (Exhibitor/Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
  const exhibitorId = req.params.exhibitorId;

  if (!exhibitorId) {
    return next(new ErrorResponse('Missing exhibitorId in the URL', 400));
  }

  req.body.exhibitor = exhibitorId;

  const productData = { ...req.body, images: [] };

  // Handle image uploads (optional)
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `product-images/${exhibitorId}`,
        resource_type: 'image',
      });
      productData.images.push(result.secure_url);
    }
  }

  const product = await Product.create(productData);

  res.status(201).json({ success: true, data: product });
});


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Exhibitor)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Ensure the logged-in user is the owner of the product
  if (product.exhibitor.toString() !== req.user.id) {
    return next(new ErrorResponse(`User is not authorized to update this product`, 401));
  }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Exhibitor)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Ensure the logged-in user is the owner of the product
  if (product.exhibitor.toString() !== req.user.id) {
    return next(new ErrorResponse(`User is not authorized to delete this product`, 401));
  }
  
  // TODO: Add logic to delete associated images from Cloudinary here if desired.

  await product.remove();

  res.status(200).json({ success: true, data: {} });
});