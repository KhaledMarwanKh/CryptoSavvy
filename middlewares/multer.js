const multer = require('multer');

// تحديد مكان واسم الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // المسار الذي سيتم حفظ الصور فيه
},
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // تسمية الملفات
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = [  'image/jpeg',  'image/jpg',  'image/png',  'image/webp','image/gif','image/svg+xml','application/pdf']; 
   if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('image or pdf only'), false);
  }
};
const upload = multer({ storage,fileFilter });

module.exports=upload