const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchasync = require("../utils/catchasync");
const AppError = require("../utils/appError");

const cloudinary = require('cloudinary').v2
const apiFeatures = require('../utils/apiFeatures')
const sendEmail = require('../utils/email')



const createSendToken = (nuser, statusCode, res, userType) => {
  const token = generatetoken(nuser);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: 'none'
  };

  res.cookie("jwt", token, cookieOption);
  nuser.password = undefined;
  res.status(statusCode).json({
    status: "success",
    userType,
    token
  });
};

const generatetoken = (id) =>
  jwt.sign(
    { email: id.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

const uploadAndDelete = async (file) => {
  const filePath = path.resolve(file.path);

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
  });

  fs.unlinkSync(filePath); // حذف الملف بعد رفعه
  return result.secure_url;
};
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000)
  });

  res.status(200).json({
    status: 'success',
    message: 'logout successfly'
  });
}; exports.signup = catchasync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // إنشاء المستخدم الجديد
  const newUser = await userModel.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  // إنشاء رمز التفعيل (يمكنك استخدام نفس createPasswordResetCode)
  const verificationCode = newUser.createPasswordResetCode();
  await newUser.save({ validateBeforeSave: false });

  try {
    // إرسال الإيميل مع كود التفعيل
    await sendEmail.sendEmail2({
      email: newUser.email,
      subject: "رمز تفعيل الحساب (صالح لمدة 10 دقائق)",
      html: `
        <p>مرحبًا ${newUser.name || "عزيزي المستخدم"}،</p>
        <p>شكرًا لتسجيلك في منصة تيليسكوب للخدمات التعليمية.</p>
        <p>رمز تفعيل حسابك هو:</p>
        <h2 style="color:#4a90e2;letter-spacing:3px;">${verificationCode}</h2>
        <p>الرمز صالح لمدة <strong>10 دقائق</strong> فقط.</p>
        <hr>
        <p>منصة تيليسكوب للخدمات التعليمية 🚀</p>
      `,
      text: `رمز تفعيل حسابك هو: ${verificationCode}. صالح لمدة 10 دقائق.`,
    });

    res.status(201).json({
      status: "success",
      message: `تم إرسال رمز التفعيل إلى البريد الإلكتروني ${newUser.email}`,
    });

  } catch (err) {
    newUser.resetCode = undefined;
    newUser.resetCodeExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(new AppError("حدث خطأ أثناء إرسال البريد الإلكتروني.", 500));
  }


  // createSendToken(newUser, 201, res);
});
exports.successSingnUp = catchasync(async (req, res, next) => {
  const resetCode = req.body.code;
  const { email } = req.body;
  let user = await userModel.findOne({
    email,
    resetCode: resetCode,
    resetCodeExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("الرمز غير صحيح أو منتهي الصلاحية", 400));
  }
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  user.activate = true;
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 200, res);

})
exports.login = catchasync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  let user;
  let userType;

  user = await userModel.findOne({ email, activate: true }).select("+password");

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const correct = await user.correctpassword(password, user.password);


  if (!correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res, { userType });
});



exports.getProfile = catchasync(async (req, res, next) => {
  const { userid } = req.body;
  const userdata = await userModel.findById(userid).select("-password");

  res.json({ status: "success", data: userdata });
});
exports.updateProfile = catchasync(async (req, res, next) => {
  let imageUrl = ""
  const { userid, name } = req.body;
  const updateData = {};

  if (name) updateData.name = name;

  await userModel.findByIdAndUpdate(userid, updateData);

  res.status(200).json({
    status: "success",
    message: "updated data"
  })
});

