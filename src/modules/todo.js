// src/modules/todo.js
const Todo = (title, description, dueDate, priority) => {
    return {
        title,
        description,
        dueDate,
        priority,
        completed: false, // Default value for new todos
        
        // Methods that each todo can perform
        toggleComplete() {
            this.completed = !this.completed;
        },
        
        edit(newTitle, newDescription, newDueDate, newPriority) {
            this.title = newTitle;
            this.description = newDescription;
            this.dueDate = newDueDate;
            this.priority = newPriority;
        }
    };
};

export default Todo;