// The Beatles' MusicBrainz ID
const beatlesMBID = 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d';

// Function to fetch Beatles albums
async function fetchBeatlesAlbums() {
    const url = `https://musicbrainz.org/ws/2/release-group?artist=${beatlesMBID}&type=album&fmt=json`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'UMfinal/1.0.0 (raymondzhongzhong@gmail.com)'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Convert data to a formatted JSON string
        const jsonString = JSON.stringify(data, null, 2);
        
        // Write to a local file
        const fs = require('fs');
        fs.writeFileSync('beatles_albums.json', jsonString);
        
        console.log('Data has been saved to beatles_albums.json');
        return data;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call the function
fetchBeatlesAlbums();

async function createChart() {
    // Load the data
    const response = await fetch('beatles_albums.json');
    const data = await response.json();
    
    // Process the data to count albums by decade
    const albumsByDecade = data['release-groups'].reduce((acc, album) => {
        if (album['first-release-date']) {
            const year = parseInt(album['first-release-date'].substring(0, 4));
            const decade = Math.floor(year / 10) * 10;
            acc[decade] = (acc[decade] || 0) + 1;
        }
        return acc;
    }, {});

    // Convert to array format for D3
    const chartData = Object.entries(albumsByDecade).map(([decade, count]) => ({
        decade: parseInt(decade),
        count: count
    })).sort((a, b) => a.decade - b.decade);

    // Set up chart dimensions
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.decade))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.count)])
        .nice()
        .range([height, 0]);

    // Create and add the bars
    svg.selectAll('rect')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.decade))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
        .attr('fill', 'steelblue');

    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d => `${d}s`));

    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .text('Decades');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left)
        .attr('text-anchor', 'middle')
        .text('Number of Albums');

    // Add title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Beatles Albums by Decade');
}

// Call the function when the page loads
createChart();
