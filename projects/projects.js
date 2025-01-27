import { fetchJSON, renderProjects } from '../global.js';

(async () => {
  try {
    // Add a log to check if the function is being called
    console.log('Fetching projects...');
    const projects = await fetchJSON('../lib/projects.json');

    // Check if projects data is valid
    if (!Array.isArray(projects)) {
      throw new Error('Invalid project data format. Expected an array.');
    }

    // Select the container for rendering projects
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
      throw new Error('Projects container element not found.');
    }

    // Render the projects
    if (projects.length === 0) {
      projectsContainer.innerHTML = '<p>No projects available at the moment.</p>';
    } else {
      projects.forEach(project => {
        renderProjects(project, projectsContainer, 'h2');
      });
    }
  } catch (error) {
    console.error('Error loading or rendering projects:', error);
  }
})();

const projectsContainer = document.querySelector('.projects');
console.log('Projects Container:', projectsContainer); // This will confirm container selection
