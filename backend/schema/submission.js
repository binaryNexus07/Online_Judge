import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
{
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true,
    },

    problemId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Problem",
        required:true,
        index:true,
    },

    code:{
        type:String,
        required:true,
        trim:true,
    },

    language:{
        type:String,
        required:true,
        enum:["cpp","java","javascript","python"],
    },

    status:{
        type:String,
        enum:[
            "pending",
            "judging",
            "accepted",
            "wrong_answer",
            "time_limit_exceeded",
            "memory_limit_exceeded",
            "runtime_error",
            "compile_error"
        ],
        default:"pending",
        index:true,
    },

    runtime:{
       type:Number 
    },
    memory:{
        type:Number
    },

    passedTestCases:{
        type:Number,
        default:0,
    },

    totalTestCases:{
        type:Number,
        default:0,
    },

    executionTime:{
        type:Number
    },

    errorOutput:{
        type:String,
    },
    compileOutput:{
        type:String,
    },
    executionOutput:{
        type:String,
    },

    judge0Token:{
        type:String,
    },
    accepted:{
        type:Boolean,
        default:false,
    },

    submissionTime:{
        type:Date,
        default:Date.now,
    }

},
{
    timestamps:true,
}
);

export const Submission =mongoose.model("Submission", submissionSchema);