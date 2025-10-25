import express from "express"
const app=express()
const port: number = Number(process.env.PORT) || 1337


app.use(express.static('./dist/'))