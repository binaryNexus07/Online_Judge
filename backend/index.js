import "dotenv/config";
import app from "./app.js";
import connectDB from "./database/db.js";
import { initializeAdmin } from "./controllers/auth.controllers.js";

const PORT=process.env.PORT || 3000;

connectDB()
.then(async()=>{
    await initializeAdmin();
    app.listen(PORT,()=> console.log(`server is running on port${PORT}`));
})
.catch((err)=>{
    console.error("mongodb connection is error",err);
    process.exit(1);
});