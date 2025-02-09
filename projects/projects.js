import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let svg = d3.select("svg");

// Fetch project data once and use it across both visualization and search
async function fetchProjects() {
    try {
        const projects = await fetchJSON("../lib/projects.json");
        setupPieChart(projects);
        setupSearch(projects);
        renderAllProjects(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
}

// **PIE CHART VISUALIZATION**
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
    svg.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, idx) => colors(idx));

    // Update legend
    let legend = d3.select(".legend").html("");
    data.forEach((d, idx) => {
        legend.append("li")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "10px")
            .html(`
                <span class="swatch" style="background-color: ${colors(idx)};"></span>
                ${d.label} <em>(${d.value})</em>
            `);
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
                <p>${project.description}</p>
                <small>Year: ${project.year}</small>
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

// **RENDER ALL PROJECTS INITIALLY**
function renderAllProjects(projects) {
    const projectsContainer = document.querySelector(".projects");
    const projectsTitle = document.querySelector("#project-count");

    if (projectsTitle) {
        projectsTitle.textContent = projects.length;
    }

    projectsContainer.innerHTML = "";
    if (projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    projects.forEach((project) => {
        renderProjects(project, projectsContainer, "h2");
    });
}

// **LOAD EVERYTHING**
fetchProjects();
