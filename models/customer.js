import mongoose from "mongoose";


const CustomerSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    totalSpends:{
        type:Number,
        default:0,
    },
    visitCount:{
        type:Number,
        default:1,
    },
    lastSeen:{
        type:Date,
        default:Date.now,
    },
},{timestamps:true});
export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);