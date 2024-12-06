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

// Array of bands with their MBIDs
const bands = [
    { name: 'The Beatles', mbid: 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d' },
    { name: 'Nirvana', mbid: '5b11f4ce-a62d-471e-81fc-a69a8278c7da' },
    { name: 'Pink Floyd', mbid: '83d91898-7763-47d7-b03b-b92132375c47' },
    { name: 'Led Zeppelin', mbid: '678d88b2-87b0-403b-b63d-5da7465aecc3' }
];

// Function to fetch data for a single band
async function fetchBandData(band) {
    const url = `https://musicbrainz.org/ws/2/release?artist=${band.mbid}&fmt=json&limit=100`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'YourApp/1.0.0 ( your@email.com )'
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

// Function to process data for streamgraph
function processDataForStream(bandsData) {
    // Get all unique years
    const years = new Set();
    bandsData.forEach(band => {
        Object.keys(band.data).forEach(year => years.add(parseInt(year)));
    });
    
    // Create array of years in order
    const yearArray = Array.from(years).sort((a, b) => a - b);
    
    // Create data structure for streamgraph
    return yearArray.map(year => {
        const entry = { year };
        bandsData.forEach(band => {
            entry[band.name] = band.data[year] || 0;
        });
        return entry;
    });
}

// Function to create the streamgraph
function createStreamGraph(data) {
    // Hide loading message
    document.getElementById('loading').style.display = 'none';
    
    // Clear existing chart
    d3.select("#chart").html("");

    // Set dimensions and margins
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get band names for the layers - Update this to use selectedBands instead of bands
    const keys = selectedBands.map(band => band.name);

    // Set up scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    // Create the streamgraph
    const stack = d3.stack()
        .offset(d3.stackOffsetWiggle)
        .keys(keys);

    const series = stack(data);

    // Color scale
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);

    // Y scale
    const y = d3.scaleLinear()
        .domain([
            d3.min(series, layer => d3.min(layer, d => d[0])),
            d3.max(series, layer => d3.max(layer, d => d[1]))
        ])
        .range([height, 0]);

    // Area generator
    const area = d3.area()
        .x(d => x(d.data.year))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);

    // Add the streams
    svg.selectAll("path")
        .data(series)
        .join("path")
        .attr("d", area)
        .attr("fill", ({ key }) => color(key))
        .attr("opacity", 0.8)
        .style("transition", "transform 0.2s ease")
        .on("mouseover", function() {
            d3.select(this)
                .style("transform", "scale(1.02)")
                .attr("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("transform", "scale(1)")
                .attr("opacity", 0.8);
        })
        .append("title")
        .text(({ key }) => key);

    // Update X axis with more readable year labels
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d => Math.round(d).toString())
            .ticks(10));

    // Add X axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text("Year");

    // Update legend position and styling
    const legendPadding = 10;
    const legendRectSize = 15;
    const legendSpacing = 5;
    const legendX = width - 150;
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendX}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
        .data(keys)  // This will now use the dynamic selectedBands
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing + 5)})`)
        .style("cursor", "pointer");

    // Add colored rectangles
    legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .attr("rx", 2) // Rounded corners
        .attr("fill", color)
        .attr("opacity", 0.8);

    // Add text labels
    legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - 3)
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text(d => d);

    // Add legend title
    legend.append("text")
        .attr("class", "legend-title")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text("Bands");

    // Add legend background (optional)
    const legendBBox = legend.node().getBBox();
    legend.insert("rect", ":first-child")
        .attr("x", -legendPadding)
        .attr("y", -legendPadding - 10)
        .attr("width", legendBBox.width + (legendPadding * 2))
        .attr("height", legendBBox.height + (legendPadding * 2))
        .style("fill", "white")
        .style("opacity", 0.9)
        .attr("rx", 5); // Rounded corners

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Band Releases Over Time");

    // Add interactivity to the layers
    svg.selectAll("path")
        .style("cursor", "pointer")
        .on("click", async function(event, d) {
            // Get the year from the mouse position
            const mouseX = d3.pointer(event)[0];
            const year = Math.round(x.invert(mouseX));
            
            // Get the artist name from the layer
            const artist = d.key;
            
            // Find the genre for this artist from your data
            const artistData = selectedBands.find(band => band.name === artist);
            const genre = artistData ? artistData.genre : '';

            // Show loading state
            const recommendationDiv = document.getElementById('recommendation');
            recommendationDiv.innerHTML = 'Loading recommendation...';
            
            // Get and display recommendation
            const recommendation = await getRecommendation(artist, year, genre);
            
            if (recommendation) {
                recommendationDiv.innerHTML = `
                    <div class="recommendation-card">
                        <h3>Recommended Track</h3>
                        <p>Based on ${artist} from ${year}</p>
                        <p>Track: ${recommendation.name}</p>
                        <p>Artist: ${recommendation.artist}</p>
                        ${recommendation.preview_url ? 
                            `<audio controls>
                                <source src="${recommendation.preview_url}" type="audio/mpeg">
                            </audio>` 
                            : ''}
                        <a href="${recommendation.external_url}" target="_blank">Open in Spotify</a>
                    </div>
                `;
            } else {
                recommendationDiv.innerHTML = 'No recommendation found.';
            }
        });

    // Update the stream paths to add click handlers
    svg.selectAll("path")
        .data(series)
        .join("path")
        .attr("d", area)
        .style("fill", d => color(d.key))
        .style("cursor", "pointer")
        .on("click", async (event, d) => {
            const year = Math.round(x.invert(d3.pointer(event)[0]));
            const artist = d.key;
            const genre = selectedBands.find(band => band.name === artist)?.genre;
            
            if (genre) {
                await recommendSong(year, genre, artist);
            }
        });

    // Create stream paths with enhanced interactivity
    const streams = svg.selectAll("path")
        .data(series)
        .join("path")
        .attr("class", "stream")
        .attr("d", area)
        .attr("fill", ({ key }) => color(key))
        .attr("opacity", 0.8)
        .style("transition", "opacity 0.2s ease");  // Smooth opacity transition

    // Add overlay and mouse tracking
    const overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");

    const mouseLine = svg.append("line")
        .attr("class", "mouse-line")
        .style("stroke", "#999")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    const mouseYear = svg.append("text")
        .attr("class", "mouse-year")
        .style("opacity", "0")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px");

    // Add tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("padding", "10px")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("pointer-events", "none");

    // Enhanced mouse event handlers
    overlay
        .on("mouseover", () => {
            mouseLine.style("opacity", "1");
            mouseYear.style("opacity", "1");
            tooltip.style("opacity", 1);
        })
        .on("mouseout", () => {
            mouseLine.style("opacity", "0");
            mouseYear.style("opacity", "0");
            tooltip.style("opacity", 0);
            // Reset all streams to default opacity
            streams.attr("opacity", 0.8);
        })
        .on("mousemove", function(event) {
            const [mouseX, mouseY] = d3.pointer(event);
            const year = Math.round(x.invert(mouseX));
            
            // Update vertical line
            mouseLine
                .attr("x1", mouseX)
                .attr("y1", 0)
                .attr("x2", mouseX)
                .attr("y2", height);
            
            // Update year text
            mouseYear
                .attr("x", mouseX)
                .attr("y", -5)
                .text(year);

            // Find data for this year
            const yearData = data.find(d => Math.round(d.year) === year);
            if (yearData) {
                // Find the closest stream to the mouse position
                let minDistance = Infinity;
                let closestStream = null;
                let closestBand = null;

                series.forEach((streamData, i) => {
                    const dataPoint = streamData.find(d => Math.round(d.data.year) === year);
                    if (dataPoint) {
                        const streamY = (y(dataPoint[0]) + y(dataPoint[1])) / 2;
                        const distance = Math.abs(mouseY - streamY);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestStream = i;
                            closestBand = streamData.key;
                        }
                    }
                });

                // Highlight closest stream
                streams.attr("opacity", (d, i) => 
                    i === closestStream ? 1 : 0.3
                );

                // Update tooltip content
                const releases = yearData[closestBand];
                tooltip
                    .html(`
                        <strong>${closestBand}</strong><br>
                        Year: ${year}<br>
                        Releases: ${releases || 0}
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            }
        });

    // Add CSS styles (you can move these to your stylesheet)
    d3.select("head").append("style").html(`
        .tooltip {
            font-family: sans-serif;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: opacity 0.2s;
        }
        .stream {
            transition: opacity 0.2s ease;
        }
        .mouse-line {
            transition: opacity 0.2s ease;
        }
    `);
}
// Helper functions for loading states
function showLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    loading.style.color = 'initial';
    loading.textContent = 'Loading data...';
}


function showError(message) {
    const loading = document.getElementById('loading');
    loading.style.color = 'red';
    loading.textContent = `Error: ${message}`;
}

