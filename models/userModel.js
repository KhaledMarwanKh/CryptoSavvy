const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"], // يفضل إضافة required
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // يعمل فقط عند التخزين .save() أو .create()
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: Date, // ضروري إضافته ليعمل ميثود changedPasswordAfter
    resetCode: String,
    resetCodeExpires: Date,
    activate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// --- Middleware لتشفير كلمة المرور وتحديث وقت التغيير ---
userSchema.pre("save", async function () {
  // 1) إذا لم يتم تعديل الباسورد، اخرج من الدالة
  if (!this.isModified("password")) return;

  // 2) تشفير الباسورد
  this.password = await bcrypt.hash(this.password, 12);

  // 3) حذف حقل التأكيد
  this.passwordConfirm = undefined;

  // 4) تحديث وقت تغيير الباسورد (فقط إذا لم يكن الحساب جديداً)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// --- Instance Methods ---
userSchema.methods.correctpassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return changedTimestamp > jwtTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetCode = function () {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetCode = resetCode;
  this.resetCodeExpires = Date.now() + 10 * 60 * 1000;
  return resetCode;
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;