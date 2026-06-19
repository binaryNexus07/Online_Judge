import mongoose from "mongoose";

const testCaseSchema=new mongoose.Schema({
    problemId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
        index:true,
    },
    input:{
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    output:{
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    explanation:{
        type: String,
        trim: true,
    },
    isHidden:{
        type: Boolean,
        default: false,
    }
},{timestamps:true});
export const TestCase = mongoose.model("TestCase", testCaseSchema);