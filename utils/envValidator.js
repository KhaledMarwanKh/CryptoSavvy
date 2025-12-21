const Joi = require('joi');
const logger = require('./logger');

const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(4000),
    DATABASE: Joi.string().required().description('MongoDB connection string'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_EXPIRES_IN: Joi.string().default('90d'),
    GEMINI_API_KEY: Joi.string().required().description('Google Gemini API Key'),
    GNEWS_API_KEY: Joi.string().required(),
    AI_SERVICE_URL: Joi.string().uri().default('http://localhost:8000'),
}).unknown();

const validateEnv = () => {
    const { value, error } = envVarsSchema.validate(process.env);

    if (error) {
        logger.error(`Config validation error: ${error.message}`);
        // In production, we should probably exit
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    return value;
};

module.exports = validateEnv;
