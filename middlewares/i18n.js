const ar = require('../locales/ar.json');
const en = require('../locales/en.json');

// مخزن ترجمات متعدد اللغات
const translations = {
  ar,
  en
};

/**
 * Middleware لتعيين دالة الترجمة إلى request object
 * تحديد اللغة من:
 * 1. Query parameter: ?lang=ar أو ?lang=en
 * 2. Header: Accept-Language: ar-SA أو en-US
 * 3. Default: en
 */
const i18nMiddleware = (req, res, next) => {
  // تحديد اللغة من Query أولاً
  let language = req.query.lang;

  // إذا لم تكن موجودة في query، البحث في Accept-Language header
  if (!language) {
    const acceptLanguage = req.headers['accept-language'] || '';
    if (acceptLanguage.includes('ar')) {
      language = 'ar';
    } else if (acceptLanguage.includes('en')) {
      language = 'en';
    }
  }

  // تعيين لغة افتراضية إذا لم يتم تحديد أي لغة
  language = language && translations[language] ? language : 'en';

  // حفظ اللغة في request object
  req.language = language;

  /**
   * دالة الترجمة الرئيسية
   * الاستخدام: req.t('auth.email_required')
   * مع متغيرات: req.t('common.welcome', { name: 'أحمد' })
   */
  req.t = (key, variables = {}) => {
    const keys = key.split('.');
    let translation = translations[language];

    // الحصول على القيمة من nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // إذا لم يتم العثور على الترجمة، إرجاع المفتاح
        return key;
      }
    }

    // استبدال المتغيرات في النص
    if (typeof translation === 'string') {
      Object.keys(variables).forEach(varKey => {
        const regex = new RegExp(`{{${varKey}}}`, 'g');
        translation = translation.replace(regex, variables[varKey]);
      });
      return translation;
    }

    return key;
  };

  next();
};

module.exports = i18nMiddleware;
