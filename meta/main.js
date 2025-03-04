let data = [];
let commits = [];
let xScale, yScale;
let selectedCommits = [];
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let filteredCommits = [];
let NUM_ITEMS;
let ITEM_HEIGHT = 80;
let VISIBLE_COUNT = 10;
let totalHeight;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  displayStats();
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/sarahhe05/dsc106-lab1-portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        configurable: true,
        writable: true
      });
      return ret;
    });
  commits.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

function displayStats() {
  processCommits();
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
  );
  const avgFileLength = Math.round(d3.mean(fileLengths, (d) => d[1]));
  dl.append('dt').text('Average file length');
  dl.append('dd').text(avgFileLength + ' lines');
  const fileCount = d3.group(data, d => d.file).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(fileCount);
}

const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 20 };
const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');
  if (Object.keys(commit).length === 0) return;
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  const padding = 10;
  tooltip.style.left = `${event.clientX + padding}px`;
  tooltip.style.top = `${event.clientY + padding}px`;
}

function createScatterplot() {
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`);
  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  svg.append('g').attr('class', 'dots');
  xScale = d3.scaleTime().range([usableArea.left, usableArea.right]);
  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  updateScatterplot(commits);
}

function updateScatterplot(filteredCommits) {
  const svg = d3.select('#chart svg');
  if (!svg.node()) return;
  xScale.domain(d3.extent(filteredCommits, d => d.datetime)).nice();
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');
  svg.select('.x-axis').call(xAxis);
  svg.select('.y-axis').call(yAxis);
  svg.select('.gridlines').call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  );
  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
  const dots = svg.select('.dots')
    .selectAll('circle')
    .data(filteredCommits, d => d.id);
  dots.exit().remove();
  const dotsEnter = dots.enter()
    .append('circle')
    .attr('r', 0)
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7);
  dots.merge(dotsEnter)
    .transition()
    .duration(300)
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines));
  dots.merge(dotsEnter)
    .on('mouseenter', function(event, commit) {
      d3.select(this).style('fill-opacity', 1).classed('selected', true);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', function(event, commit) {
      d3.select(this).style('fill-opacity', 0.7).classed('selected', isCommitSelected(commit));
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  d3.selectAll('circle').classed('selected', d => isCommitSelected(d));
}

function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
}

function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');
  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap(d => d.lines);
  const breakdown = d3.rollup(
    lines,
    v => v.length,
    d => d.type
  );
  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function filterCommitsByTime() {
  commitMaxTime = timeScale.invert(commitProgress);
  filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
  // Also update the file sizes scrollytelling section (see below)
}

function updateTimelineDisplay() {
  const selectedTime = document.querySelector('#timeline-control time');
  selectedTime.textContent = commitMaxTime.toLocaleString('en', {
    dateStyle: "full",
    timeStyle: "short"
  });
  filterCommitsByTime();
  updateScatterplot(filteredCommits);
  updateFileVisualization(filteredCommits);
}

function initializeTimeline() {
  timeScale = d3.scaleTime()
    .domain([
      d3.min(commits, d => d.datetime),
      d3.max(commits, d => d.datetime)
    ])
    .range([0, 100]);
  commitMaxTime = timeScale.invert(commitProgress);
  filteredCommits = [...commits];
  const slider = document.querySelector('#timeline-slider');
  slider.value = commitProgress;
  slider.addEventListener('input', (event) => {
    commitProgress = +event.target.value;
    updateTimelineDisplay();
  });
  updateTimelineDisplay();
}

function brushed(evt) {
  let brushSelection = evt.selection;
  selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter(commit => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.datetime);
        let y = yScale(commit.hourFrac);
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function brushSelector() {
  const svg = document.querySelector('svg');
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

function initializeScrollytelling() {
  NUM_ITEMS = commits.length;
  totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
  const scrollContainer = d3.select('#scroll-container');
  const spacer = d3.select('#spacer');
  spacer.style('height', `${totalHeight}px`);
  scrollContainer.on('scroll', () => {
    const scrollTop = scrollContainer.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
    renderItems(startIndex);
  });
  renderItems(0);
}

function renderItems(startIndex) {
  const itemsContainer = d3.select('#items-container');
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  const newCommitSlice = commits.slice(startIndex, endIndex);
  updateScatterplot(newCommitSlice);
  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .attr('class', 'item')
    .html((d, i) => `
      <p>
        On ${d.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made 
        <a href="${d.url}" target="_blank">
          ${i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
        </a>. 
        I edited ${d.totalLines} lines across ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.
      </p>
    `);
}

// --- File Sizes Scrollytelling Section ---
// Now we use commit data for the second scrollytelling.
// The left side will update the file dots (grouped by file from the commit slice)
// The right side will display commit narrative in the desired format.

function initializeFileSizesScrollytelling() {
  // Use the commits array (already sorted by datetime)
  const ITEM_HEIGHT_FILES = 80;
  const VISIBLE_COUNT_FILES = 10;
  const totalHeightFiles = (commits.length - 1) * ITEM_HEIGHT_FILES;
  d3.select('#spacer-files').style('height', `${totalHeightFiles}px`);
  const scrollContainerFiles = d3.select('#scroll-container-files');
  scrollContainerFiles.on('scroll', () => {
    const scrollTop = scrollContainerFiles.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT_FILES);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT_FILES));
    renderCommitItems(commits, startIndex, VISIBLE_COUNT_FILES);
  });
  renderCommitItems(commits, 0, VISIBLE_COUNT_FILES);
}

function renderCommitItems(commitsData, startIndex, visibleCount) {
  const endIndex = Math.min(startIndex + visibleCount, commitsData.length);
  const commitSlice = commitsData.slice(startIndex, endIndex);
  
  // Update narrative (right side) using commit narrative format.
  renderSecondScrolly(commitSlice);
  
  // Update file dots (left side) by grouping the commit slice by file.
  const fileGroups = d3.groups(commitSlice.flatMap(d => d.lines), d => d.file)
                        .map(([name, lines]) => ({ name, lines }));
  updateFileDots(fileGroups);
}

function renderSecondScrolly(data) {
  const storyContainer = d3.select('#second-scrolly');

  // Clear previous messages
  storyContainer.selectAll('.item').remove();

  // Generate new messages based on the updated format
  data.forEach((d, i) => {
    // Create a new "item" div for each message
    const itemDiv = storyContainer.append('div')
        .attr('class', 'item');

    // Append the <p> element inside the "item" div
    itemDiv.append('p')
        .html(`
            On ${new Date(d.datetime).toLocaleString("en", {
                dateStyle: "full",
                timeStyle: "short"
            })}, I made 
            <a href="${d.url}" target="_blank">
                ${i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
            </a>. 
            I edited ${d.totalLines} lines across 
            ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.
        `);
  });
}

function updateFileDots(fileGroups) {
  const fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  const container = d3.select('#files-dots').select('dl.files');
  container.selectAll('div').remove();
  
  const filesDiv = container.selectAll('div')
    .data(fileGroups)
    .enter()
    .append('div');
  
  filesDiv.append('dt')
    .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  
  filesDiv.append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  createScatterplot();
  initializeScrollytelling();
  initializeFileSizesScrollytelling();
  initializeTimeline();
});
