const express=require('express')
const jwt=require('jsonwebtoken')
const path=require('path')
const cors=require('cors')

const app=express()
app.use(express.json())
app.use(cors())
const users=[]
const todos=[]

const JWT_SECRET="hellorandomuser"

app.use(express.static(path.join(__dirname,"public")))

app.post('/signup',function(req,res){
    const username=req.body.username
    const password=req.body.password

    if(!username || !password){
        return res.json({
            message:"Username and password fields cannot be empty"
        })
    }

    if(username.length<3){
        return res.json({
            message:"Username must have at least 3 characters"
        })
    }
    if(users.find((user)=>user.username===username)){
        return res.json({
            message:"You are already signned in!"
        })
    }

    users.push({
        username:username,
        password:password
    })

    res.json({
        message:"You have signed up successfully!"
    })
})

app.post("/signin",function(req,res){
    const username=req.body.username
    const password=req.body.password
    
    if(!username || !password){
        return res.json({
            message:"Username and password required"
        })
    }
    const foundUser=users.find((user)=>user.username===username && user.password===password)

    if(foundUser){
        const token=jwt.sign({username},JWT_SECRET)
        res.json({
            token,message:"You are signned in successfully!",username
        })
    }else{
        res.json({
            message:"Invalid username or password"
        })
    }
})

function auth(req,res,next){
    const token=req.headers.authorization
    if(!token){
        return res.json({
            message:"No token found"
        })
    }
    try{
        const decode=jwt.verify(token,JWT_SECRET)
        req.username=decode.username
        next()
    }catch(error){
        res.json({
            message:"Invalid token"
        })
    }
}

app.get('/todos',auth,function(req,res){
    const curruser=req.username

    const usertodo=todos.filter((todo)=>todo.username==curruser)

    res.json(usertodo)
})

app.post('/todos',auth,function(req,res){
    const title=req.body.title
    const curruser=req.username

    if(!title){
        return res.json({
            message:"Title not found"
        })
    }
    const newTodo={
        id:todos.length+1,
        username:curruser,
        title,
        done:false
    }
    todos.push(newTodo)
    res.json({
        message:"Todo created successfully"
    })
})

app.put("/todos/:id",auth,function(req,res){
    const id=req.params.id
    const title=req.body.title
    const curruser=req.username

    const todo=todos.find((todo)=>todo.id===parseInt(id) && todo.username===curruser)

    if(!title){
        return res.json({
            message:"Todo can not be empty"
        })
    }
    todo.title=title
    res.json({
        message:"Todo updated successfully"
    })
})

app.delete('/todos/:id',auth,function(req,res){
    const id=req.params.id;
    const curruser=req.username

    const todoIndex=todos.findIndex((todo)=>todo.id===parseInt(id) && todo.username===curruser)

    if(todoIndex===-1){
        return res.json({
            message:"Todo bot found"
        })
    }
    todos.splice(todoIndex,1)

    res.json({
        message:"Todo deleted successfully"
    })
})

app.put("/todos/:id/done",auth,function(req,res){
    const id=req.params.id
    const curruser=req.username

    const todo=todos.find((todo)=>todo.id===parseInt(id) && todo.username===curruser)

    if(!todo){
        return res.json({
            message:"Todo not found"
        })
    }

    todo.done=!todo.done

    res.json({
        message:`Todo marked as ${todo.done?"done":"undone"}`,todo
    })
})

app.listen(3000)