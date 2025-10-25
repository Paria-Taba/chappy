import express from "express"
const app=express()
import userRouter from "./routes/userRouter.js"
const port: number = Number(process.env.PORT) || 4000

app.use("/users",userRouter)

app.use(express.static('./dist/'))

app.listen(port,()=>{
	console.log(`server run on port ${port}`)
})