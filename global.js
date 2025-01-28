console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/sarahhe05', title: 'GitHub' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

const basePath = location.hostname === 'sarahhe05.github.io' && location.pathname.startsWith('/dsc106-lab1-portfolio')
    ? '/dsc106-lab1-portfolio'
    : ''; // Add base path for pages in subdirectories, like the home page of the project


for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // If not on the home page and the URL is a relative path, prepend '../' to make it work correctly
    if (!ARE_WE_HOME && !url.startsWith('http') && !url.startsWith('/')) {
        url = basePath + '/' + url;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    // Highlight the current page link
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';
    }
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  
  const themeSwitcher = document.getElementById('theme-switcher');
themeSwitcher.addEventListener('change', () => {
  const theme = themeSwitcher.value; // Get the selected value
  document.documentElement.style.colorScheme = theme; // Update the color scheme
  localStorage.setItem('theme', theme); // Save the preference
});

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  themeSwitcher.value = savedTheme;
  document.documentElement.style.colorScheme = savedTheme;
}

// Get a reference to the <select> element
const select = document.querySelector('.color-scheme select');

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
  });

select.addEventListener('input', function (event) {
  const newColorScheme = event.target.value;

  // Update the root element's color-scheme property
  document.documentElement.style.setProperty('color-scheme', newColorScheme);

  // Save the user's preference in localStorage
  localStorage.colorScheme = newColorScheme;
});


// Check if a color scheme is saved in localStorage
const savedColorScheme = localStorage.colorScheme;

// If a preference is found, apply it to the root element and set the dropdown value
if (savedColorScheme) {
  document.documentElement.style.setProperty('color-scheme', savedColorScheme);
  select.value = savedColorScheme;
} else {
  // Default to 'light dark'
  select.value = 'light dark';
}

// Ensure the form is found before adding the event listener
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Create a FormData object to capture form data
    const data = new FormData(form);

    // Build the mailto URL with proper encoding
    let url = 'mailto:yih092@ucsd.edu'; // Replace with your email address
    let params = [];

    // Loop over the FormData object and encode the form fields
    for (let [name, value] of data) {
      params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    }

    // Concatenate the base URL and encoded parameters
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    // Open the constructed mailto URL
    location.href = url;
  });
}


export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    // Parse the response as JSON and return the data
    const data = await response.json();
    console.log('Fetched data:', data);  // Log the fetched data
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// Function to count projects and update the count dynamically
function countProjects(projects) {
  const projectCountElement = document.getElementById('project-count');
  if (projectCountElement) {
    projectCountElement.innerText = projects.length; // Update the count based on the number of projects
  } else {
    console.error("Project count element not found.");
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  // Validate headingLevel
  const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadingLevels.includes(headingLevel)) {
      console.error(`Invalid heading level: ${headingLevel}. Defaulting to 'h2'.`);
      headingLevel = 'h2';  // Default to h2 if the heading level is invalid
  }

  // Create the article element
  const article = document.createElement('article');

  // Create dynamic heading
  const heading = document.createElement(headingLevel);
  heading.innerText = project.title;
  
  // Append heading to the article
  article.appendChild(heading);

  // Add image and description
  const imageSrc = project.image ? project.image : 'https://vis-society.github.io/labs/2/images/empty.svg';
  article.innerHTML += `
      <img src="${imageSrc}" alt="${project.title}">
      <p>${project.description}</p>
  `;
  
  // Append the article to the container
  containerElement.appendChild(article);
}

export async function fetchGitHubData(username) {
  try {
    // Fetch data from GitHub's API using the username
    return await fetchJSON(`https://api.github.com/users/${username}`);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
  }
}