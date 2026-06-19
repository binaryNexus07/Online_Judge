import mongoose from "mongoose";

const exampleSchema=new mongoose.Schema({
    input:{
        type: String,
        required: true,
        trim: true,
    },
    output:{
        type: String,
        required: true,
        trim: true,
    },
    explanation:{
        type: String,
        required: true,
        trim: true,
    }
})
const codeTemplateSchema = new mongoose.Schema({
    language:{
        type: String,
        required:true,
        trim: true,
    },
    starterCode:{
        type: String,
        required: true,
        trim: true,
    }
})
const solutionSchema = new mongoose.Schema({
    language:{
        type: String,
        required: true,
        trim: true,
    },
    solution:{
        type: String,
        required: true,
        trim: true,
    }
})
const problemSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug:{
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  description:{ 
    type: String,
    required: true,
    trim: true,
  },
  difficulty:{
    type: String,
    required: true,
    trim: true,
    enum: ["easy", "medium", "hard"],
  },
  tags:{
    type: [String],
    trim: true,
  },
  constraints:{
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  timeLimit:{
    type: Number,
    required: true
  },  
  memoryLimit:{
    type: Number,
    required: true,
  },
  examples:[exampleSchema],
  codeTemplate:[codeTemplateSchema],
  solution:[solutionSchema],
  functionName:{
    type: String,
    required: true,
    trim: true,
  },
  parameterTypes:{
      type: [String],
      required: true,
      trim: true,
  },
  hints:{
    type:String,
    trim: true,
  },
  createBy:{
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: "User",
  },
  updateBy:{
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: "User",
  },
  createdAt: Date,
  updatedAt: Date,
});

export const Problem = mongoose.model("Problem", problemSchema);
