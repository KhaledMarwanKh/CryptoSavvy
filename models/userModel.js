const mongoose = require('mongoose')
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require('crypto')



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide your name"],
    },
    email: {
      type: String,
      required: [true, "please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "please confirm a password"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "passwords are not the same",
      },
    },
    resetCode: String,
    resetCodeExpires: Date,
    activate: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // delete only when password actuly modified
  if (!this.isModified("password")) return next();
  //hash password
  this.password = await bcrypt.hash(this.password, 12);
  //delete password confirm after check our password
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctpassword = async function (
  candidatepassword,
  userpassword,
) {
  // copmare use it for verfy from (password encoded) and (password login)
  return await bcrypt.compare(candidatepassword, userpassword);
};
userSchema.methods.changedPasswordAfter = function (jwttimetamp) {
  if (this.passwordChangedAt) {
    // the time that user do change password
    const changedtimetamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedtimetamp > jwttimetamp;
  }
  // false means password not changed
  return false;
};
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.createPasswordResetCode = function () {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetCode = resetCode;
  this.resetCodeExpires = Date.now() + 10 * 60 * 1000;

  return resetCode;
};
const userModel = mongoose.model('user', userSchema)

module.exports = userModel