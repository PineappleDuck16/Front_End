// Initial bands array is now empty as we'll add bands dynamically
let selectedBands = [];

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to search MusicBrainz for artists
async function searchArtists(query) {
    if (!query) return [];
    
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'YourApp/1.0.0 (1187418302@qq.com)'
            }
        });
        const data = await response.json();
        return data.artists.map(artist => ({
            name: artist.name,
            mbid: artist.id,
            type: artist.type || 'Unknown'
        }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Function to update the search results display
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    searchResults.style.display = results.length ? 'block' : 'none';

    results.forEach(artist => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.textContent = `${artist.name} (${artist.type})`;
        div.onclick = () => addBand(artist);
        searchResults.appendChild(div);
    });
}

// Function to add a band to the selected list
function addBand(band) {
    if (!selectedBands.find(b => b.mbid === band.mbid)) {
        selectedBands.push(band);
        updateBandsList();
    }
    document.getElementById('bandSearch').value = '';
    document.getElementById('searchResults').style.display = 'none';
}

// Function to remove a band from the selected list
function removeBand(mbid) {
    selectedBands = selectedBands.filter(band => band.mbid !== mbid);
    updateBandsList();
}

// Function to update the displayed list of selected bands
function updateBandsList() {
    const bandsList = document.getElementById('bandsList');
    const updateButton = document.getElementById('updateChart');
    bandsList.innerHTML = '';
    
    selectedBands.forEach(band => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${band.name}
            <span class="remove-band" onclick="removeBand('${band.mbid}')">&times;</span>
        `;
        bandsList.appendChild(li);
    });

    // Enable/disable update button based on selection
    updateButton.disabled = selectedBands.length === 0;
    if (selectedBands.length === 0) {
        document.getElementById('chartContainer').classList.add('hidden');
    }
}

// Initialize the event listeners
function initializeControls() {
    const searchInput = document.getElementById('bandSearch');
    const updateButton = document.getElementById('updateChart');
    const chartContainer = document.getElementById('chartContainer');

    // Initially hide the chart container
    chartContainer.classList.add('hidden');
    updateButton.disabled = true;

    // Add debounced search
    const debouncedSearch = debounce(async (query) => {
        const results = await searchArtists(query);
        displaySearchResults(results);
    }, 300);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.getElementById('searchResults').style.display = 'none';
        }
    });

    // Update chart button
    updateButton.addEventListener('click', () => {
        if (selectedBands.length > 0) {
            initVisualization();
        }
    });
}

// Modified initVisualization function
async function initVisualization() {
    const loadingElement = document.getElementById('loading');
    const chartContainer = document.getElementById('chartContainer');
    const chartElement = document.getElementById('chart');

    try {
        // Show loading state
        loadingElement.classList.remove('hidden');
        chartContainer.classList.remove('hidden');
        chartElement.innerHTML = '';

        const bandsData = [];
        for (const band of selectedBands) {
            const data = await fetchBandData(band);
            bandsData.push(data);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Respect rate limiting
        }
        
        const processedData = processDataForStream(bandsData);
        loadingElement.classList.add('hidden');
        createStreamGraph(processedData);
    } catch (error) {
        loadingElement.textContent = `Error: ${error.message}`;
        console.error(error);
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeControls();
});


// Function to fetch data for a single band
async function fetchBandData(band) {
    const url = `https://musicbrainz.org/ws/2/release?artist=${band.mbid}&fmt=json&limit=100`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'final2/1.0.0 ( 1187418302@qq.com )'
            }
        });
        const data = await response.json();
        
        // Process releases by year
        const songsByYear = data.releases.reduce((acc, release) => {
            if (release.date) {
                const year = parseInt(release.date.substring(0, 4));
                acc[year] = (acc[year] || 0) + 1;
            }
            return acc;
        }, {});

        return { name: band.name, data: songsByYear };
    } catch (error) {
        console.error(`Error fetching data for ${band.name}:`, error);
        return { name: band.name, data: {} };
    }
}

// Function to process data for the stream graph
function processDataForStream(bandsData) {
    console.log("Input bandsData:", bandsData); // Debug log

    if (!bandsData || !Array.isArray(bandsData)) {
        console.error("Invalid bandsData:", bandsData);
        return [];
    }

    // Get all unique years across all bands
    const years = new Set();
    bandsData.forEach(band => {
        if (band && band.data) {
            Object.keys(band.data).forEach(year => years.add(parseInt(year)));
        }
    });

    // Convert to array and sort
    const sortedYears = Array.from(years).sort((a, b) => a - b);

    // Create data points for each year
    const processedData = sortedYears.map(year => {
        const dataPoint = { year };
        bandsData.forEach(band => {
            if (band && band.name && band.data) {
                dataPoint[band.name] = band.data[year] || 0;
            }
        });
        return dataPoint;
    });

    console.log("Processed data:", processedData); // Debug log
    return processedData;
}

function createStreamGraph(data) {
    // Clear existing chart
    d3.select("#chart").html("");

    // Set dimensions
    const margin = { top: 60, right: 120, bottom: 20, left: 100 };
    const width = 960 - margin.left - margin.right;
    const height = selectedBands.length * 100; // Dynamic height based on bands

    // Create SVG
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for ridgeline format
    const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
    const processedData = selectedBands.map(band => {
        return {
            name: band.name,
            values: years.map(year => ({
                year: year,
                value: data.find(d => d.year === year)?.[band.name] || 0
            }))
        };
    });

    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => 
            d3.max(selectedBands, band => d[band.name] || 0)
        )])
        .range([60, 0]); // 60 is the height of each ridge

    // Create color scale
    const color = d3.scaleOrdinal()
        .domain(selectedBands.map(b => b.name))
        .range(d3.schemeCategory10);

    // Create the area generator
    const area = d3.area()
        .x(d => x(d.year))
        .y0(y(0))
        .y1(d => y(d.value))
        .curve(d3.curveBasis);

    // Create ridges
    const ridges = svg.selectAll(".ridge")
        .data(processedData)
        .join("g")
        .attr("class", "ridge")
        .attr("transform", (d, i) => `translate(0, ${i * 70})`);

    // Add areas
    ridges.append("path")
        .attr("class", "area")
        .attr("d", d => area(d.values))
        .attr("fill", d => color(d.name))
        .attr("opacity", 0.7)
        .attr("stroke", d => d3.rgb(color(d.name)).darker(0.5))
        .attr("stroke-width", 1);

    // Add x-axis for each ridge
    ridges.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 60)`)
        .call(d3.axisBottom(x)
            .tickFormat(d => Math.round(d).toString())
            .ticks(10)
            .tickSize(4))
        .style("font-size", "10px");

    // Add band labels
    ridges.append("text")
        .attr("x", -10)
        .attr("y", 30)
        .attr("text-anchor", "end")
        .attr("fill", d => d3.rgb(color(d.name)).darker(0.5))
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(d => d.name);

    // Add CSS styles
    d3.select("head").append("style").html(`
        .ridge path {
            transition: opacity 0.2s, stroke-width 0.2s;
        }
        .x-axis line {
            stroke: #ddd;
        }
        .x-axis path {
            display: none;
        }
    `);

    // Add hover interactions
    ridges.selectAll("path")
        .on("mouseover", function() {
            d3.select(this)
                .attr("opacity", 1)
                .attr("stroke-width", 2);
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("opacity", 0.7)
                .attr("stroke-width", 1);
        });
}

