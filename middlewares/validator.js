const { body, query, param, validationResult } = require("express-validator");
const appError = require("../utils/appError");

/**
 * Middleware to handle the result of the validation.
 * يدعم الترجمة متعددة اللغات
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

// Helper function لإنشاء validators بسهولة مع الترجمة
const createValidator = (req, fieldName, validator) => {
    // سيتم استدعاؤه بشكل ديناميكي
    return validator;
};

// Auth Validations
exports.signupValidator = [
    body("name")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.name_required'))
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage((value, { req }) => req.t('auth.name_length')),
    body("email")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.email_required'))
        .isEmail()
        .withMessage((value, { req }) => req.t('auth.email_invalid'))
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.password_required'))
        .isLength({ min: 8 })
        .withMessage((value, { req }) => req.t('auth.password_min'))
        .matches(/\d/)
        .withMessage((value, { req }) => req.t('auth.password_number'))
        .matches(/[a-z]/)
        .withMessage((value, { req }) => req.t('auth.password_lowercase'))
        .matches(/[A-Z]/)
        .withMessage((value, { req }) => req.t('auth.password_uppercase'))
        .matches(/[!@#$%^&*]/)
        .withMessage((value, { req }) => req.t('auth.password_special')),
    body("passwordConfirm")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.password_confirm_required'))
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(req.t('auth.password_mismatch'));
            }
            return true;
        }),
    validate,
];

exports.loginValidator = [
    body("email")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.email_required'))
        .isEmail()
        .withMessage((value, { req }) => req.t('auth.email_invalid'))
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.password_required')),
    validate,
];

exports.forgetPasswordValidator = [
    body("email")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.email_required'))
        .isEmail()
        .withMessage((value, { req }) => req.t('auth.email_invalid'))
        .normalizeEmail(),
    validate,
];

exports.resetPasswordValidator = [
    body("email")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.email_required'))
        .isEmail()
        .withMessage((value, { req }) => req.t('auth.email_invalid'))
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.password_required'))
        .isLength({ min: 8 })
        .withMessage((value, { req }) => req.t('auth.password_min')),
    body("passwordConfirm")
        .notEmpty()
        .withMessage((value, { req }) => req.t('auth.password_confirm_required'))
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(req.t('auth.password_mismatch'));
            }
            return true;
        }),
    validate,
];

// Crypto History Validation
exports.getCryptoHistoryValidator = [
    query("symbol")
        .notEmpty()
        .withMessage((value, { req }) => req.t('crypto.invalid_symbol', { symbol: value }))
        .isString()
        .trim()
        .toUpperCase(),
    query("period")
        .optional()
        .matches(/^\d+[dwhm]$/)
        .withMessage((value, { req }) => req.t('crypto.invalid_range')),
    query("interval")
        .optional()
        .matches(/^\d+[hmd]$/)
        .withMessage((value, { req }) => req.t('crypto.invalid_range')),
    validate,
];

// AI Predict Validation
exports.predictValidator = [
    query("symbol")
        .notEmpty()
        .withMessage((value, { req }) => req.t('crypto.invalid_symbol', { symbol: value }))
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
        .withMessage((value, { req }) => req.t('ai.invalid_input')),
    validate,
];