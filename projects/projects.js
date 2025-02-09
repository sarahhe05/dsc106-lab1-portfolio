import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let svg = d3.select("svg");

// Fetch project data once and use it across both visualization and search
async function fetchProjects() {
    try {
        const projects = await fetchJSON("../lib/projects.json");
        setupPieChart(projects);
        setupSearch(projects);
        renderAllProjects(projects); // Initial render of all projects
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
}

// **PIE CHART VISUALIZATION**
let selectedIndex = -1; // No selected wedge initially

function setupPieChart(projects) {
    let rolledData = d3.rollups(
        projects,
        (v) => v.length, // Count projects per year
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({ value: count, label: year }));
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    svg.selectAll("*").remove(); // Clear previous chart

    let arcData = sliceGenerator(data);
    let arcs = svg.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, idx) => colors(idx))
        .on("click", (event, d) => {
            // Toggle selection
            selectedIndex = selectedIndex === d.index ? -1 : d.index;

            // Apply the selected class to highlight the wedge
            svg.selectAll("path")
                .attr("class", (_, idx) => selectedIndex === idx ? "selected" : "");

            // Apply the selected class to the legend
            let legend = d3.select(".legend");
            legend.selectAll("li")
                .attr("class", (_, idx) => selectedIndex === idx ? "selected" : "");

            // Change swatch color based on selected path
            legend.selectAll("li")
                .each(function(_, idx) {
                    d3.select(this).select(".swatch")
                        .style("background-color", selectedIndex === idx ? "var(--color)" : colors(idx)); // Highlight selected with a different color (e.g., orange)
                });

            // Filter projects based on selected year
            if (selectedIndex === -1) {
                renderAllProjects(projects); // Show all projects if no wedge is selected
            } else {
                const selectedYear = data[selectedIndex].label;
                const filteredProjects = projects.filter(project => project.year === selectedYear);
                renderAllProjects(filteredProjects); // Show projects for the selected year
            }
        });

    // Update legend with default colors
    let legend = d3.select(".legend").html("");
    data.forEach((d, idx) => {
        legend.append("li")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "10px")
            .html(`
                <span class="swatch"></span>
                ${d.label} <em>(${d.value})</em>
            `)
            .select(".swatch")
            .style("background-color", colors(idx)); // Set default color (based on the color scale)
    });
}


// **SEARCH FUNCTIONALITY**
function setupSearch(projects) {
    let searchInput = document.querySelector(".searchBar");
    let projectsContainer = document.querySelector(".projects");
    let resultsContainer = document.querySelector("#results");

    function displayFilteredProjects(filteredProjects) {
        resultsContainer.innerHTML = "";
        if (filteredProjects.length === 0) {
            resultsContainer.innerHTML = "<p>No projects found.</p>";
            return;
        }

        resultsContainer.classList.add("projects"); // Apply the same styling as .projects

        filteredProjects.forEach((project) => {
            let projectItem = document.createElement("article");
            projectItem.classList.add("project-item");
            projectItem.innerHTML = `
                <img src="${project.image}" alt="${project.title}" class="project-img">
                <h3>${project.title}</h3>
                <div>
                <p>${project.description}</p>
                <p>${project.year}</p>
                </div>
            `;
            resultsContainer.appendChild(projectItem);
        });
    }

    searchInput.addEventListener("input", (event) => {
        let query = event.target.value.toLowerCase();

        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join("\n").toLowerCase();
            return values.includes(query);
        });

        if (query.length > 0) {
            projectsContainer.style.display = "none";
            resultsContainer.style.display = "grid";
            displayFilteredProjects(filteredProjects);
        } else {
            projectsContainer.style.display = "grid";
            resultsContainer.style.display = "none";
        }
    });
}

// **RENDER PROJECTS (filtered or all)**
function renderAllProjects(projects) {
    const projectsContainer = document.querySelector(".projects");
    const projectsTitle = document.querySelector("#project-count");

    if (projectsTitle) {
        projectsTitle.textContent = `${projects.length}`; // Update project count
    }

    // Clear previous projects before rendering new ones
    projectsContainer.innerHTML = "";

    if (projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    // Render each project in the filtered list
    projects.forEach((project) => {
        renderProjects(project, projectsContainer, "h2");
    });
}


// **LOAD EVERYTHING**
fetchProjects();
