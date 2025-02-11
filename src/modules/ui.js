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

    // Cache Form
    const todoFormContainer = document.querySelector('.todo-form-container');
    const projectFormContainer = document.querySelector('.project-form-container');
    const todoForm = document.querySelector('#todo-form');
    const projectForm = document.querySelector('#project-form');

    // Track state
    let currentProject = null;
    let projects = []; // Add this to track all projects

    // Initialize app
    function initializeListeners() {
        newProjectBtn.addEventListener('click', createNewProject);
        newTodoBtn.addEventListener('click', createNewTodo);

        // Add form cancel button listeners
        const projectCancelBtn = projectForm.querySelector('.btn-cancel');
        const todoCancelBtn = todoForm.querySelector('.btn-cancel');
    
        projectCancelBtn.addEventListener('click', () => {
            projectFormContainer.classList.add('hidden');
            projectForm.reset();
        });
    
        todoCancelBtn.addEventListener('click', () => {
            todoFormContainer.classList.add('hidden');
            todoForm.reset();
        });
        
        loadProjects(); // Load saved projects when app starts
    }

    // Project Creation and Display
    function createNewProject() {
        projectFormContainer.classList.remove('hidden');
        // Remove any existing listener before adding a new one
        projectForm.removeEventListener('submit', handleProjectSubmit);
        projectForm.addEventListener('submit', handleProjectSubmit);

        const cancelBtn = projectForm.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', () => {
            projectFormContainer.classList.add('hidden');
            projectForm.reset();
        });
    }

    //Handle project form submission
    function handleProjectSubmit(e) {
        e.preventDefault();
        const projectName = projectForm.querySelector('#project-name').value;

        if (projectName) {
            const project = Project(projectName);
            projects.push(project);
            displayProject(project);
            saveProjects();

            projectFormContainer.classList.add('hidden');
            projectForm.reset();
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
                if (todoData.completed) {
                    todo.toggleComplete();
                }
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

        todoFormContainer.classList.remove('hidden');
        // Remove any existing listener before adding a new one
        todoForm.removeEventListener('submit', handleTodoSubmit);
        todoForm.addEventListener('submit', handleTodoSubmit);

        // const cancelBtn = todoForm.querySelector('.btn-cancel');
        // cancelBtn.addEventListener('click', () => {
        //     todoFormContainer.classList.add('hidden');
        //     todoForm.reset();
        // });
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
                todoFormContainer.classList.remove('hidden');

                // Pre-fill the form with current values
                todoForm.querySelector('#todo-title').value = todo.title;
                todoForm.querySelector('#todo-description').value = todo.description;
                todoForm.querySelector('#todo-date').value = todo.dueDate;
                todoForm.querySelector('#todo-priority').value = todo.priority;

                // Remove any existing submit listeners and add new one for editing
                todoForm.removeEventListener('submit', handleTodoSubmit);
                todoForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const newTitle = todoForm.querySelector('#todo-title').value;
                    const newDescription = todoForm.querySelector('#todo-description').value;
                    const newDueDate = todoForm.querySelector('#todo-date').value;
                    const newPriority = todoForm.querySelector('#todo-priority').value;

                    todo.edit(newTitle, newDescription, newDueDate, newPriority);
                    displayTodos(currentProject.getTodos());
                    saveProjects();

                    todoFormContainer.classList.add('hidden');
                    todoForm.reset();
                }, { once: true }); // Ensure the listener is removed after use
            })

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

    function handleTodoSubmit(e) {
        e.preventDefault();

        const title = todoForm.querySelector('#todo-title').value;
        const description = todoForm.querySelector('#todo-description').value;
        const dueDate = todoForm.querySelector('#todo-date').value;
        const priority = todoForm.querySelector('#todo-priority').value;

        const todo = Todo(title, description, dueDate, priority);
        currentProject.addTodo(todo);
        displayTodos(currentProject.getTodos());
        saveProjects();

        todoFormContainer.classList.add('hidden');
        todoForm.reset();
    }

    // Public methods
    return {
        initialize: initializeListeners
    };
})();

export default UI;