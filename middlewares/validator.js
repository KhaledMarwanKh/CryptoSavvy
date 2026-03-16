const { body, query, param, validationResult } = require("express-validator");
const appError = require("../utils/appError");

/**
 * Middleware to handle the result of the validation.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(err.msg));

    return next(new appError(extractedErrors.join(". "), 400));
};

// Auth Validations
exports.signupValidator = [
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[!@#$%^&*]/)
        .withMessage("Password must contain at least one special character"),
    body("passwordConfirm")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password confirmation does not match password");
            }
            return true;
        }),
    validate,
];

exports.loginValidator = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
];

exports.forgetPasswordValidator = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    validate,
];

exports.resetPasswordValidator = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    body("passwordConfirm")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password confirmation does not match password");
            }
            return true;
        }),
    validate,
];

// Crypto History Validation
exports.getCryptoHistoryValidator = [
    query("symbol")
        .notEmpty()
        .withMessage("Symbol is required")
        .isString()
        .trim()
        .toUpperCase(),
    query("period")
        .optional()
        .matches(/^\d+[dwhm]$/)
        .withMessage("Period must be a number followed by d, w, h, or m"),
    query("interval")
        .optional()
        .matches(/^\d+[hmd]$/)
        .withMessage("Interval must be a number followed by h, m, or d"),
    validate,
];

// AI Predict Validation
exports.predictValidator = [
    query("symbol")
        .notEmpty()
        .withMessage("Symbol is required")
        .isString()
        .trim()
        .toUpperCase(),
    query("interval")
        .optional()
        .isString()
        .trim(),
    query("candles")
        .optional()
        .isInt({ min: 100, max: 1000 })
        .withMessage("Candles must be an integer between 100 and 1000"),
    validate,
];