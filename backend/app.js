import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import problemRouter from "./routes/problem.routes.js";
import TestCaseRouter from  "./routes/test.routes.js";
import submitCodeRouter  from "./routes/submission.routes.js";

const app=express();


const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173").split(",").map(o => o.trim());
app.use(cors({
    origin: allowedOrigins,
    credentials:true,
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


//routes
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/problem",problemRouter);
app.use("/api/v1/testCase",TestCaseRouter);
app.use("/api/v1/submission",submitCodeRouter);

app.get("/",(req,res)=>{
    res.send("Hello World");
});


app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"Route not Found",
    })
});

export default app;