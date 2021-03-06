const path = require('path');
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require('../utils/geocoder');
const asyncHandler = require("../middleware/async");
const colors = require('colors');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @acces   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .json(res.advancedResults);
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @acces   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/:id
// @acces   Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @acces   Private
exports.updateBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @acces   Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  //const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  bootcamp.remove(); 

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    GET bootcamp within a raius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @acces   Private
exports.getBootcampsInRaius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3.963 mi / 6.378 km
  const radius = distance / 6378

  const bootcamps = await Bootcamp.find({ 
     location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });

});

// @desc    Upload photo for  bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @acces   Private
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
  //const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(
      new ErrorResponse(`Please upload a file`, 400)
    );
  }

  const file = req.files.file;

  console.log(file);

  //Maka sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse(`Please upload an image file`, 400)
    );
  }

  //Check filesize
  if(file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`image file bigger than ${process.env.MAX_FILE_UPLOAD} bytes`, 400)
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
 
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse(`Problem with file upload`, 500)
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });

  });
});