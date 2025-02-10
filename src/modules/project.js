// src/modules/project.js
const Project = (name) => {
    // This is a private variable - it can't be accessed directly from outside
    const todos = [];
    
    return {
        name,
        // Methods to interact with the private todos array
        addTodo(todo) {
            todos.push(todo);
        },
        
        removeTodo(todoIndex) {
            todos.splice(todoIndex, 1);
        },
        
        getTodos() {
            return todos;
        }
    };
};

export default Project;