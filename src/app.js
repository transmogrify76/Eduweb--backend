import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";





const app = express()
app.use(cors({
    origin:process.env.CORS,
    credentials: true
}))

app.use(express.json({
    limit:"16kb",
}))

app.use(express.urlencoded({extended:true,
    limit:"16kb"
}))

app.use(cookieParser());

app.use(express.static("public"))

import studentRout from "./routes/student.routes.js"
import parentRout from "./routes/parent.routes.js"

app.use("/student",studentRout)
app.use("/parent",parentRout)

export default app