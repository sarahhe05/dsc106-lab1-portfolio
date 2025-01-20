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

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

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

// Get a reference to the <select> element
const select = document.querySelector('.color-scheme select');

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