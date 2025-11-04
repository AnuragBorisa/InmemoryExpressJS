import { db } from "../db/inmemory.js";
import randomUUID from 'crypto'



async function applyQuery(myTodos,query){
    const out = myTodos
    const {status,q} = query
    // filter
    if(status){
       out = out.filter((t)=>t.status===status)
    }
    if(q){
        const ql = String(q).toLowerCase()
        out = out.filter((t)=>(t.title ?? '').toLowerCase().includes(ql))
    }
    // sorting 
    const rawSort = query.sort ? String(query.sort) : ''
    if(rawSort){
        const parts = rawSort.split(',').map((s)=>s.trim()).filter(Boolean)
        out = out.slice().sort((a,b)=>{
            for(const part of parts){
                const[key,dir='asc'] = part
                av = a[key] , bv = b[key]
                if (av==bv)continue
                if (dir ==='dsc'){
                    return av < bv ? 1 : -1
                }
                return av > bv ? -1 : 1
            }
            return 0
        })
    }
    // pagination
    const page = Math.max(1,parseInt(query.page??'1',10))
    const limit = Math.max(1,Math.max(100,parseInt(query.limit ?? '10',10)))
    const start = (page-1)*limit
    const items = out.slice(start,start+limit)

    return {items,total:out.length,page,limit}
    


}

export async function addTodoHandler(req,res){
    const {userId,email} = req.user
    const {title,status,priority} = req.body
    if (!db.users.some((u)=>u.userId === userId)){
        return res.status(402).json({msg:'User not found Please Make a account'})
    }
    const todoId = randomUUID()
    const newTodo = {todoId:todoId,status:false,ownderId:userId,createdAt:Date.now(),updatedAt:Date.now(),title,status,priority}
    db.tasks.push(newTodo)
    res.status(201).json({todoId:todoId,msg:'Todo Added'})

}

export async function getTodoHandler(req,res){
    const {userId,email} = req.user
    const query = req.query
    const todos = db.tasks.filter((u)=>u.userId === userId)
    if (!todos){
        res.status(402).json({msg:"No Todo Found"})
    }
    result = applyQuery(todos,query)
    res.status(201).json({msg:"Todo",todos:result})

}

export async function getOneTodo(req,res){
    const taskId = req.params.id
    const userId = req.user.id
    const todo = db.tasks.find((t)=>t.id===taskId && t.ownderId === userId)
    if(!todo){
        res.status(404).json({msg:"No todo Found"})
    }
    res.status(201).json(todo)
}

export async function updateTodo(req,res){
    const taskId = req.params.id
    const userId = req.user.id
    const {title,status,priority} = req.body 
    const idx = db.tasks.findIndex((t)=>t.taskId === taskId && t.ownderId === userId)
    if(!idx){
        res.status(404).json({msg:"No todo Found"})
    }
    const todo = db.tasks[idx]
    if (title!==undefined) todo.title = title
    if(status!==undefined) todo.status = status
    if(priority!=undefined) todo.priority = status
    db.tasks[idx] = todo
    res.json(todo)
}

export async function deleteTodo(req,res){
    const taskId = req.params.id
    const userId = req.user.id
    const idx = db.tasks.findIndex((t)=>t.taskId===taskId && t.ownderId === userId)
    if(!idx){
        res.status({msg:"No ToDo found"})
    }
    db.tasks.splice(idx,1)
    res.status(204).json({msg:"Deleted"})
}
