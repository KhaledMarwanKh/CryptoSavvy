const catchasync = require('../utils/catchasync')
const appError = require('../utils/appError')
const jwt = require("jsonwebtoken");
const userModel = require('../models/userModel');
const sendEmail = require('../utils/email')
const crypto = require('crypto')
const createSendToken = (nuser, statusCode, res) => {
  const token = generatetoken(nuser);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);
  nuser.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
  });
};

const generatetoken = (id) =>
  jwt.sign(
    { id: id._id, email: id.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );


exports.authUser = catchasync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new appError("You are not logged in, please log in to get access", 401)
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user still exists
  const currentuser = await userModel.findById(decoded.id).select("-password");
  if (!currentuser) {
    return next(
      new appError("The user belonging to this token does no longer exist", 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError("User recently changed password! Please log in again.", 401)
    );
  }

  // Grant access to protected route
  req.user = currentuser;
  req.body.userid = currentuser.id;
  next();
});
// api for forget  password
exports.forgetPassword = catchasync(async (req, res, next) => {
  const { email } = req.body;

  let account = await userModel.findOne({ email });
  let role = "user";


  if (!account) {
    account = await teacherModel.findOne({ email });
    role = "teacher";
  }

  if (!account) {
    return next(new appError("There is no user or teacher with this email address", 404));
  }

  // توليد رمز إعادة تعيين كلمة المرور
  const resetCode = account.createPasswordResetCode();
  await account.save({ validateBeforeSave: false });

  try {
    // إرسال الإيميل
    await sendEmail.sendEmail2({
      email: account.email,
      subject: "Your password reset code (valid for 10 minutes)",
      message: `Your password reset code is: <strong>${resetCode}</strong>. It will expire in 10 minutes.`,
      html: `<p>Your password reset code is: <strong>${resetCode}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.status(200).json({
      status: "success",
      message: `Reset code sent to ${role} email.`,
    });

  } catch (err) {
    account.passwordresetExpired = undefined;
    account.passwordresettoken = undefined;
    await account.save({ validateBeforeSave: false });
    return next(err);
  }
});
exports.verifyResetCode = catchasync(async (req, res, next) => {
  const { email, code } = req.body;

  let account = await userModel.findOne({
    email,
    resetCode: code,
    resetCodeExpires: { $gt: Date.now() },
  });

  if (!account) {
    return next(new appError("code is not correct or not available", 400));
  }
  account.resetCode = undefined;
  account.resetCodeExpires = undefined;

  await account.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: `code is success (${role})`,
  });
});

// api for reset password
exports.resetPassword = catchasync(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  let account = await userModel.findOne({
    email
  });

  if (!account) {
    return next(new appError("code is not available", 400));
  }


  account.password = password;
  account.passwordConfirm = passwordConfirm;

  await account.save({ validateBeforeSave: false });


  createSendToken(account, 200, res);
});

