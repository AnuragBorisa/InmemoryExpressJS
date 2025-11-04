import express from 'express'
import cookieParser from 'cookie-parser'
import { notFound,errorHandler } from './middleware/error.js'
import { loginHandler, refreshTokenUpdate, singUpHandler } from './services/auth.js'
import {authorise} from './middleware/auth.js'
import { addTodoHandler,getTodoHandler, deleteTodo, getOneTodo, updateTodo } from './services/todos.js'
const app = express()


app.use(express.json())
app.use(cookieParser())

app.get('/heatlh',(req,res)=>{
res.status(200).json({ok:true})
})
// auth
app.get('/signUp',singUpHandler)
app.get('/login',loginHandler)
app.get('/refreshTokenUpdate',refreshTokenUpdate)

// todos
app.post('add-todo',authorise,addTodoHandler)
app.get('/todos',authorise,getTodoHandler)
app.get('/todo/:id',authorise,getOneTodo)
app.patch('/todo/:id',authorise,updateTodo)
app.delete('/todo/:id',authorise,deleteTodo)


app.use(notFound)
app.use(errorHandler)

export default app