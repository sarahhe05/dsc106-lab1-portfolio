import { fetchJSON, renderProjects } from '../global.js';

async function loadProjects() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        
        // Select the container element where the projects will be rendered
        const projectsContainer = document.querySelector('.projects');
        
        // Select the projects-title element to display the count
        const projectsTitle = document.querySelector('.projects-title');
        
        // Update the title with the count of projects
        if (projectsTitle) {
            projectsTitle.innerHTML = `${projects.length} Projects`; // Show count in title
        }
        
        // Clear the existing content (optional, if you want to clear before rendering)
        projectsContainer.innerHTML = '';
        
        // If the projects array is empty, display a placeholder message
        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p>No projects available.</p>';
            return; // Stop further execution
        }

        // Render each project
        projects.forEach(project => {
            renderProjects(project, projectsContainer, 'h2');
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

loadProjects();
