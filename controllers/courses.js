const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const colors = require('colors');
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc    Get bootcamps
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @acces   Public
exports.getCourses = asyncHandler(async(req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults);
    } 
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @acces   Public
exports.getCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No course found with the id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add a course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @acces   Private
exports.addCourse = asyncHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
 
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp found with the id of ${req.params.bootcampId}`), 404);
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @acces   Private
exports.updateCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
 
    if (!course) {
        return next(new ErrorResponse(`No course found with the id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @acces   Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id)
 
    if (!course) {
        return next(new ErrorResponse(`No course found with the id of ${req.params.id}`), 404);
    }

    course.remove();

    res.status(200).json({
        success: true,
        data: course
    });
});