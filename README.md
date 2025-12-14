# Tutoring Booking Backend API

This is the backend API for a tutoring booking platform built with Express.js and MongoDB. It supports Admin, Teacher, and User roles with secured routes and image upload functionality.

---

## Features

- User registration & login with JWT authentication  
- Role-based access control (Admin, Teacher, User)  
- Manage teachers, appointments, and profiles  
- Image upload support via Cloudinary  
- Security features: rate limiting, helmet, data sanitization (NoSQL, XSS), HPP




---

## 🔐 Auth APIs

| Role    | Method | Endpoint              | Description                         | Auth Required |
|---------|--------|-----------------------|-------------------------------------|---------------|
| Admin   | POST   | `/admin/login-admin`  | تسجيل دخول الأدمن                   | ❌            |
| Admin   | POST   | `/admin/logout`       | تسجيل خروج الأدمن                   | ✅            |
| Teacher | POST   | `/teacher/login-teacher` | تسجيل دخول المعلم               | ❌            |
| Teacher | POST   | `/teacher/logout`     | تسجيل خروج المعلم                   | ✅            |
| Teacher | POST   | `/teacher/signup-teacher` | تسجيل حساب معلم (مع ملفات)      | ❌            |
| User    | POST   | `/user/login`         | تسجيل دخول الطالب                   | ❌            |
| User    | POST   | `/user/register`      | تسجيل مستخدم (مع صورة)              | ❌            |
| User    | POST   | `/user/logout`        | تسجيل خروج الطالب                   | ✅            |

---

## 🔄 Password Reset APIs

| Role    | Method | Endpoint               | Description                       | Auth Required |
|---------|--------|------------------------|-----------------------------------|---------------|
| User    | POST   | `/user/forget-password`| إرسال كود إعادة تعيين كلمة السر | ❌            |
| User    | PATCH  | `/user/resetPassword`  | إعادة تعيين كلمة السر            | ❌            |
| Teacher | POST   | `/teacher/forget-password`| إرسال كود للمعلم              | ❌            |
| Teacher | PATCH  | `/teacher/resetPassword` | إعادة تعيين كلمة السر للمعلم   | ❌            |

---

## 👨‍🏫 Teacher APIs

| Method | Endpoint                          | Description                              | Auth Required |
|--------|-----------------------------------|------------------------------------------|---------------|
| GET    | `/teacher/list-teachers`          | عرض جميع المعلمين المتاحين               | ❌            |
| GET    | `/teacher/appointments`           | جلب مواعيد المعلم                        | ✅            |
| POST   | `/teacher/complete-appointments`  | إنهاء موعد                               | ✅            |
| POST   | `/teacher/cancel-appointments`    | إلغاء موعد                               | ✅            |
| POST   | `/teacher/change-availablity`     | تغيير التوفر                             | ✅            |
| GET    | `/teacher/dashboard`              | لوحة معلومات المعلم                      | ✅            |
| GET    | `/teacher/profile`                | عرض الملف الشخصي للمعلم                  | ✅            |
| POST   | `/teacher/update-profile`         | تحديث الملف الشخصي (صورة / شهادات)      | ✅            |

---

## 👩‍🎓 Student (User) APIs

| Method | Endpoint                            | Description                             | Auth Required |
|--------|-------------------------------------|-----------------------------------------|---------------|
| GET    | `/user/get-profile`                 | الحصول على الملف الشخصي                 | ✅            |
| POST   | `/user/update-Profile`              | تحديث الملف الشخصي                      | ✅            |
| POST   | `/user/book-appointment`            | حجز موعد                                | ✅            |
| GET    | `/user/current-appointments`        | قائمة المواعيد الحالية                  | ✅            |
| GET    | `/user/completed-appointments`      | قائمة المواعيد المنجزة                  | ✅            |
| GET    | `/user/cancelled-appointments`      | قائمة المواعيد الملغاة                  | ✅            |
| POST   | `/user/cancel-appointment`          | إلغاء موعد                              | ✅            |
| POST   | `/user/update-appointment`          | تحديث موعد                              | ✅            |
| GET    | `/user/get-teacher`                 | الحصول على معلومات معلم                | ✅            |
| POST   | `/user/get-nearest-teacher`         | البحث عن أقرب معلم                      | ✅            |
| POST   | `/user/connect`                     | التواصل معنا                            | ❌            |

---

## 🛠️ Admin APIs

### 👨‍🏫 Teachers Management

| Method | Endpoint                          | Description                               | Auth Required |
|--------|-----------------------------------|-------------------------------------------|---------------|
| GET    | `/admin/all-activate-teachers`    | جلب جميع المعلمين المفعّلين              | ✅            |
| GET    | `/admin/get-new-teachers`         | جلب المعلمين الجدد                        | ✅            |
| POST   | `/admin/acceptOrRejectTeacher`    | قبول أو رفض معلم                         | ✅            |
| GET    | `/admin/teachers-by-class`        | جلب المعلمين حسب الصف                    | ✅            |
| GET    | `/admin/change-state-teacher`     | تفعيل أو تعطيل حساب المعلم              | ✅            |

### 📅 Appointments Management

| Method | Endpoint                            | Description                             | Auth Required |
|--------|-------------------------------------|-----------------------------------------|---------------|
| GET    | `/admin/appointments`               | كل المواعيد                             | ✅            |
| POST   | `/admin/cancel-appointment`         | إلغاء موعد                              | ✅            |
| GET    | `/admin/admin-current-appointments` | المواعيد الحالية                        | ✅            |
| GET    | `/admin/admin-completed-appointments` | المواعيد المكتملة                     | ✅            |
| GET    | `/admin/admin-cancelled-appointments` | المواعيد الملغاة                      | ✅            |

### 📊 Statistics & General Info

| Method | Endpoint                         | Description                               | Auth Required |
|--------|----------------------------------|-------------------------------------------|---------------|
| GET    | `/admin/stats-by-teacher`       | إحصائيات حسب المعلم                       | ✅            |
| GET    | `/admin/general-info`           | معلومات عامة للنظام                      | ✅            |
| POST   | `/admin/stats-by-date-range`    | إحصائيات ضمن تاريخ محدد                  | ✅            |
| GET    | `/admin/students-by-class`      | الطلاب حسب الصف                           | ✅            |
| GET    | `/admin/all-students`           | جميع الطلاب                               | ✅            |
| GET    | `/admin/get-monthly-count`      | عدد شهري للإحصائيات                      | ✅            |
| POST   | `/admin/get-questions`          | جلب الأسئلة                               | ✅            |

---

## ✅ Notes

- كل Endpoint يعتمد على `JWT Token` يتم توليده عند تسجيل الدخول.
- يجب إرسال التوكن في Header 



### ✅ Prerequisites

Before you begin, make sure you have the following installed:

- 🟢 **Node.js** (v14 or above)  
- 📦 **npm** (comes with Node.js)  
- 🍃 **MongoDB** (local or Atlas cloud instance)  
- ☁️ **Cloudinary Account** (for uploading and hosting images)




