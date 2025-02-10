// storage.js
const Storage = (() => {
    function saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function loadProjects() {
        const projectsJSON = localStorage.getItem('projects');
        if (!projectsJSON) return []; // Return empty array if no projects found
        return JSON.parse(projectsJSON);
    }

    function saveCurrentProject(projectName) {
        localStorage.setItem('currentProject', projectName);
    }

    function loadCurrentProject() {
        return localStorage.getItem('currentProject');
    }

    return {
        saveProjects,
        loadProjects,
        saveCurrentProject,
        loadCurrentProject
    };
})();

export default Storage;