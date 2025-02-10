// ui.js
import Todo from './todo';
import Project from './project';
import Storage from './storage';

// Everything in here insta-activates!
const UI = (() => {
    // Cache DOM elements
    const projectList = document.querySelector('.project-list');
    const todoList = document.querySelector('.todo-list');
    const newProjectBtn = document.querySelector('#new-project');
    const newTodoBtn = document.querySelector('#new-todo');

    // Track state
    let currentProject = null;
    let projects = []; // Add this to track all projects

    // Initialize app
    function initializeListeners() {
        newProjectBtn.addEventListener('click', createNewProject);
        newTodoBtn.addEventListener('click', createNewTodo);
        loadProjects(); // Load saved projects when app starts
    }

    // Project Creation and Display
    function createNewProject() {
        const projectName = prompt('Enter project name:');
        if (projectName) { // Only create if user entered a name
            const project = Project(projectName); // Create new project using our factory
            projects.push(project); // Add to projects array
            displayProject(project); // Show it on the page
            saveProjects(); // Save after creating new project
        }
    }

    function displayProject(project) {
        const div = document.createElement('div');
        div.classList.add('project-item');

        div.innerHTML = `
            <span class="project-name">${project.name}</span>
            <button class="delete-project">×</button>
        `;

        // Project selection handling
        const projectName = div.querySelector('.project-name');
        projectName.addEventListener('click', () => {
            const projects = document.querySelectorAll('.project-list div');
            projects.forEach(p => p.classList.remove('selected'));
            div.classList.add('selected');

            currentProject = project;
            Storage.saveCurrentProject(project.name); // Save current selection
            displayTodos(project.getTodos());
        });

        // Delete project handling
        const deleteBtn = div.querySelector('.delete-project');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectIndex = projects.indexOf(project);
            projects.splice(projectIndex, 1);
            div.remove();

            if (currentProject === project) {
                currentProject = null;
                todoList.innerHTML = '';
                Storage.saveCurrentProject(null); // Clear current project when deleted
            }

            saveProjects();
        });


        projectList.appendChild(div);
    }

    function loadProjects() {
        const savedProjects = Storage.loadProjects();
        const lastActiveProject = Storage.loadCurrentProject();

        // If no saved projects (first time suer), create default project
        if (savedProjects.length === 0) {
            const defaultProject = Project('Default');
            projects.push(defaultProject);
            displayProject(defaultProject);
            currentProject = defaultProject;
            saveProjects();
            return;
        }

        savedProjects.forEach(projectData => {
            const project = Project(projectData.name);

            // Recreate todos for this project
            projectData.todos.forEach(todoData => {
                const todo = Todo(
                    todoData.title,
                    todoData.description,
                    todoData.dueDate,
                    todoData.priority
                );
                project.addTodo(todo);
            });

            projects.push(project);
            displayProject(project);

            // If this was the last active project, select it
            if (projectData.name === lastActiveProject) {
                const projectDivs = document.querySelectorAll('.project-list div');
                projectDivs.forEach(div => {
                    if (div.querySelector('.project-name').textContent === projectData.name) {
                        div.classList.add('selected');
                        currentProject = project;
                        displayTodos(project.getTodos());
                    }
                });
            }
        })
    }

    // Save current state to localStorage
    function saveProjects() {
        const projectsData = projects.map(project => ({
            name: project.name,
            todos: project.getTodos()
        }));
        Storage.saveProjects(projectsData);
    }

    // Todo Creation and Display
    function createNewTodo() {
        if (!currentProject) {
            alert('Please select a project first');
            return;
        }

        // Get todo details from user
        const title = prompt('Enter todo title:');

        //If user cancels or enters empty title, exit the function
        if (!title) return;

        const description = prompt('Enter description:') || ''; // Default to empty string if cancelled
        const dueDate = prompt('Enter due date:');
        if (!dueDate) return; // would prefer if we didnt force people to have a due date tho

        const priority = prompt('Enter priority (High/Medium/Low):');
        if (!priority || !['High', 'Medium', 'Low'].includes(priority)) {
            alert('Please enter a valid priority (High/Medium/Low');
            return; //Prefer if we also didnt force people to enter a thing, would rather it defaulted to something
        }

        const todo = Todo(title, description, dueDate, priority);
        currentProject.addTodo(todo);
        displayTodos(currentProject.getTodos());
        saveProjects();
    }

    // Refractor for checkmarks!
    function displayTodos(todos) {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const div = document.createElement('div');
            div.classList.add('todo-item');
            div.classList.add(`priority-${todo.priority.toLowerCase()}`);

            // Add completed class if todo is completed
            if (todo.completed) {
                div.classList.add('completed');
            }

            // Create todo HTML structure
            div.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <div class="todo-info">
                        <div class="todo-title">${todo.title}</div>
                        <div class="todo-date">${todo.dueDate}</div>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="edit-todo">✎</button>
                    <button class="delete-todo">×</button>
                </div>
            `;

            // Add checkbox functionality
            const checkbox = div.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                todo.toggleComplete();
                displayTodos(currentProject.getTodos());
                saveProjects();
            });

            // Add edit functionality
            const editBtn = div.querySelector('.edit-todo');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newTitle = prompt('Enter new title:', todo.title);
                if (!newTitle) return // If cancelled or empty, keep original

                const newDescription = prompt('Enter new description:', todo.description) || todo.description;

                const newDueDate = prompt('Enter new due date:', todo.dueDate);
                if (!newDueDate) return;
               
                const newPriority = prompt('Enter new priority (High/Medium/Low):', todo.priority);
                if (!newPriority || !['High', 'Medium', 'Low'].includes(newPriority)) {
                    alert('Please enter a valid priority (High/Medium/Low');
                    return;
                }

                todo.edit(newTitle, newDescription, newDueDate, newPriority);
                displayTodos(currentProject.getTodos());
                saveProjects();
            });

            // Add delete functionality
            const deleteBtn = div.querySelector('.delete-todo');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const todoIndex = todos.indexOf(todo);
                currentProject.removeTodo(todoIndex);
                displayTodos(currentProject.getTodos());
                saveProjects();
            });

            todoList.appendChild(div);
        });
    }

    // Public methods
    return {
        initialize: initializeListeners
    };
})();

export default UI;