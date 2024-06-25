import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json()); // This middleware parses JSON bodies

app.use(cookieParser())
app.use(morgan('dev'));


//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
app.use("/api/v1", userRouter)

export { app }