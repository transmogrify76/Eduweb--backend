import connectDb from "./db/index.js";
import dotenv from "dotenv";
import  app  from "./app.js";



dotenv.config({
    path:'/.env'
})
connectDb()
.then(
    () => {
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`server is running :${process.env.PORT}`)
        })
    }
)
.catch(
    (error) => {
        console.log("Mongo DB connection error",error)
    }
)