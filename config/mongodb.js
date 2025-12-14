const mongoose =require('mongoose')


exports.connectDb =async ()=>{
await  mongoose.connection.on('connected',()=>{console.log('success to connect on database')})
await mongoose.connect(process.env.DATABASE)
}