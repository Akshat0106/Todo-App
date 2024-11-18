// const { get } = require("http")
// const { title } = require("process")

function moveToSignUp(){
    document.getElementById('signup').style.display="block"
    document.getElementById('signin').style.display="none"
    document.getElementById('todo-container').style.display="none"
}
function moveToSignIn(){
    document.getElementById('signup').style.display="none"
    document.getElementById('signin').style.display="block"
    document.getElementById('todo-container').style.display="none"
}

function showTodo(){
    document.getElementById('signup').style.display="none"
    document.getElementById('signin').style.display="none"
    document.getElementById('todo-container').style.display="block"
    getTodo()
}

async function signup(){
    const username=document.getElementById('signup-username').value
    const password=document.getElementById('signup-password').value

    try{
        const response=await axios.post("http://localhost:3000/signup",{
            username:username,
            password:password,
        })
        alert(response.data.message)
        if(response.data.message==="You have signed up successfully!"){
            moveToSignIn()
        }
    }catch(error){
        console.error("Error while signing up",error)
    }
}

async function signin(){
    const username=document.getElementById('signin-username').value
    const password=document.getElementById('signin-password').value

    try{
        const response=await axios.post('http://localhost:3000/signin',{
            username:username,
            password:password,
        })
        if(response.data.token){
            localStorage.setItem("token",response.data.token)
            alert(response.data.message)
            showTodo()
        }else{
            alert(response.data.message)
        }
    }catch(error){
        console.error("Error while signing in",error)
    }
}

async function logout(){
    localStorage.removeItem("token")
    alert("You are logged out successfully")
    moveToSignIn()
}

async function getTodo(){
    try{
        const token=localStorage.getItem("token")

        const response=await axios.get("http://localhost:3000/todos",{
            headers:{Authorization:token}
        })

        const todolist=document.getElementById('todo-list')
        todolist.innerHTML=""

        if(response.data.length){
            response.data.forEach((todo) => {
                const todoEle=createTodoElement(todo)
                todolist.appendChild(todoEle)
            });
        }
    }catch(error){
        console.error("Error while getting Todo List",error)
    }
}

async function addTodo(){
    const inputEle=document.getElementById("input")
    const title=inputEle.value

    if(title.trim()===""){
        alert("Please write something to add to the todo list")
        return
    }

    try{
        const token=localStorage.getItem('token')
        await axios.post("http://localhost:3000/todos",{title},{
            headers:{Authorization:token}
        })

        inputEle.value=""
        getTodo()
    }catch(error){
        console.error("Error hwile adding new todo item:",error)
    }
}

async function updateTodo(id,newTitle){
    const token=localStorage.getItem("token")

    try{
        await axios.put(
            `http://localhost:3000/todos/${id}`,{title:newTitle},{
                headers:{Authorization:token}
            }
        )

        getTodo()
    }catch(error){
        console.error("Error while updating a todo item",error)
    }
}

async function deleteTodo(id){
    const token=localStorage.getItem('token')

    try{
        await axios.delete(`http://localhost:3000/todos/${id}`,{
            headers:{Authorization:token}
        })
        getTodo()
    }catch(error){
        console.error("Error while deleting a Todo item",error)
    }
}

async function toggleTodoDone(id){
    const token=localStorage.getItem("token")
    try{
        await axios.put(`http://localhost:3000/todos/${id}/done`,{
            headers:{Authorization:token}
        })
        getTodo()
    }catch(error){
        console.error("Error occured while toggling")
    }
}

function createTodoElement(todo){
    const todoDiv=document.createElement("div")
    todoDiv.className="todo-item"

    const inputEle=createInputEle(todo.title)
    inputEle.readOnly=true

    const updateBtn=createUpdateButton(inputEle,todo.id)
    const deleteBtn=createDeleteButton(todo.id)
    const doneBox=createDoneBox(todo.done,inputEle,todo.id)

    todoDiv.appendChild(inputEle)
    todoDiv.appendChild(doneBox)
    todoDiv.appendChild(updateBtn)
    todoDiv.appendChild(deleteBtn)

    return todoDiv
}

function createInputEle(value){
    const inputElement=document.createElement('input')
    inputElement.type="text"
    inputElement.readOnly=true
    inputElement.value=value
    return inputElement
}

function createUpdateButton(inputEle,id){
    const updateBtn=document.createElement('button')
    updateBtn.textContent="Edit"

    updateBtn.onclick=function(){
        if(inputEle.readOnly){
            inputEle.readOnly=false
            updateBtn.textContent="Save"
            inputEle.focus()
            inputEle.style.outline="1px solid #007BFF"
        }else{
            inputEle.readOnly=true
            updateBtn.textContent="Edit"
            inputEle.style.outline="none"
            updateTodo(id,inputEle.value)
        }
    }
    return updateBtn
}

function createDeleteButton(id){
    const deleteBtn=document.createElement("button")
    deleteBtn.textContent="Delete"

    deleteBtn.onclick=function(){
        deleteTodo(id)
    }
    return deleteBtn
}

async function toggleTodoDone(id,done){
    const token=localStorage.getItem("token")

    try{
        await axios.put(`http://localhost:3000/todos/${id}/done`,{
            done:!done
        },{
            headers:{Authorization:token}
        })
        getTodo()
    }catch(error){
        console.error("Error while toggling To-d- status:",error)
    }
}

function createDoneBox(done,inputElement,id){
    const doneCheckBox=document.createElement('input')
    doneCheckBox.type="checkBox"
    doneCheckBox.checked=done

    inputElement.style.textDecoration=done?"line-through":"none"

    doneCheckBox.onchange=function(){
        toggleTodoDone(id,done)
        inputElement.style.textDecoration=doneCheckBox.checked?"line-through":"none"
    }
    return doneCheckBox
}