import express from "express"
import cors from "cors"
const app=express()
import userRouter from "./routes/userRouter.js"
const port: number = Number(process.env.PORT) || 4000
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));

app.use("/users",userRouter)

app.use(express.static('./dist/'))

app.listen(port,()=>{
	console.log(`server run on port ${port}`)
})