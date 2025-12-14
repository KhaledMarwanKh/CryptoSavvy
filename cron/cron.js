// const cron = require('node-cron');
// const Lesson = require('../models/appointmentModel');
// const Teacher = require('../models/teacherModel');

// cron.schedule('* * * * 0', async () => {
//   const now = new Date();

//   try {
//     const lessons = await Lesson.find({
//       slotDate: { $lt: now },
//       cancelled: false,
//       isCompleted: false
//     });

//     for (const lesson of lessons) {
//       lesson.isCompleted = true;
//       await lesson.save();

//       await Teacher.findByIdAndUpdate(lesson.teacherId, {
//         $inc: { amountMoneyRequired: lesson.price*5/100 }
//       });
//     }

    
//   } catch (err) {
//     console.error('❌ error ron:', err);
//   }
// });
