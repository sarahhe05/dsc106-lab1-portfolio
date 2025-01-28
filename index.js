import { fetchJSON, renderProjects } from './global.js';
import { fetchGitHubData } from './global.js';

async function loadProjects() {
  try {
    const projects = await fetchJSON('./lib/projects.json');
    console.log('Fetched projects:', projects); // Log the fetched data to inspect

    const projectsContainer = document.querySelector('.projects');
    projectsContainer.innerHTML = ''; // Clear existing content

    // Check if there are projects
    if (projects && projects.length > 0) {
      const latestProjects = projects.slice(0, 3); // Get the first 3 projects

      // Loop through each project and render it
      latestProjects.forEach(project => {
        renderProjects(project, projectsContainer, 'h2'); // Render each project
      });
    } else {
      projectsContainer.innerHTML = '<p>No projects available.</p>';
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

loadProjects();

async function loadGitHubData() {
    try {
      const githubData = await fetchGitHubData('sarahhe05');  // Replace with your GitHub username
      console.log(githubData);  // Log the data to inspect
  
      const profileStats = document.querySelector('#profile-stats');
      if (profileStats) {
        profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
        `;
      }
    } catch (error) {
      console.error('Error loading GitHub data:', error);
    }
  }
  
  loadGitHubData();