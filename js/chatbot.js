/*===== OCEAN DATA CHATBOT FUNCTIONALITY =====*/

// Global variables
let oceanData = [];
let filteredData = [];
let chartInstance = null;

// CSV data embedded directly for demo purposes
const csvData = `Ocean,Region,Temperature_C,Salinity_PSU,Fish_Species_Count,Fish_Population_Millions,Biodiversity_Index,Primary_Fish_Species,Conservation_Status,Coral_Coverage_Percent,Plankton_Density,Water_Quality_Index,Fishing_Quota_Tons,Sustainable_Fishing_Rating,Endangered_Species_Count,Marine_Protected_Area,Depth_Meters,Coordinates_Lat,Coordinates_Lon,Data_Collection_Date
Pacific,North Pacific,12.5,34.2,1547,850.3,8.7,"Salmon,Tuna,Cod",Moderate Risk,25.4,High,7.8,125000,B+,23,Yes,2500,45.2,-120.5,2024-01-15
Atlantic,North Atlantic,8.3,35.1,1234,645.2,7.9,"Cod,Herring,Mackerel",Good,18.7,Medium,8.2,98000,A-,18,Yes,3200,52.1,-25.8,2024-01-20
Pacific,South Pacific,24.1,34.8,1876,923.7,9.2,"Tuna,Mahi-mahi,Snapper",High Risk,45.8,Very High,7.1,87000,B,31,Yes,1800,-15.3,-150.2,2024-01-25
Atlantic,South Atlantic,19.7,35.3,1345,567.8,8.1,"Tuna,Sardine,Anchovy",Moderate Risk,32.1,High,7.9,76000,B+,25,Yes,2800,-20.1,-10.4,2024-02-01
Indian,Central Indian,26.8,34.6,1623,734.5,8.5,"Tuna,Skipjack,Yellowfin",High Risk,38.2,High,7.3,69000,B-,28,Yes,2200,-10.5,75.8,2024-02-05
Arctic,Arctic Ocean,1.2,32.8,456,123.4,6.2,"Cod,Herring,Pollock",Critical Risk,5.2,Low,6.8,15000,C+,45,Yes,1200,78.2,-15.7,2024-02-10
Pacific,Central Pacific,22.3,34.5,1698,812.6,8.9,"Tuna,Mahi-mahi,Marlin",Moderate Risk,52.3,Very High,8.1,92000,A-,19,Yes,3500,5.2,-160.1,2024-02-15
Atlantic,Mediterranean,16.4,36.2,892,234.7,7.4,"Sardine,Anchovy,Tuna",High Risk,22.8,Medium,7.2,34000,C,38,Yes,1500,40.1,15.3,2024-02-20
Pacific,Coral Triangle,28.5,34.1,2847,1245.8,9.8,"Grouper,Snapper,Wrasse",Very High Risk,78.9,Extremely High,8.9,45000,A,12,Yes,500,-2.1,125.4,2024-02-25
Indian,Bay of Bengal,27.2,33.9,1456,678.3,8.3,"Hilsa,Pomfret,Mackerel",High Risk,28.7,High,7.6,58000,B,34,Yes,2100,18.5,88.2,2024-03-01
Pacific,Bering Sea,3.8,33.2,734,456.7,7.1,"Pollock,Cod,Crab",Moderate Risk,8.4,Medium,7.8,145000,A-,22,Yes,2800,58.4,-165.3,2024-03-05
Atlantic,Caribbean Sea,25.9,35.8,1234,389.2,8.4,"Grouper,Snapper,Parrotfish",High Risk,35.6,High,7.5,28000,B-,29,Yes,800,18.2,-75.6,2024-03-10
Pacific,East Pacific,18.7,34.4,1123,523.9,7.8,"Anchoveta,Sardine,Tuna",Moderate Risk,15.2,Medium,7.9,156000,B+,21,Yes,3800,15.2,-95.4,2024-03-15
Indian,Arabian Sea,24.6,35.5,1389,612.4,8.2,"Kingfish,Pomfret,Tuna",High Risk,21.3,Medium,7.4,47000,B,32,Yes,2600,15.8,65.2,2024-03-20
Atlantic,Norwegian Sea,6.2,34.9,678,345.6,7.6,"Cod,Herring,Mackerel",Good,12.5,Medium,8.3,89000,A,16,Yes,2200,68.5,5.8,2024-03-25
Pacific,Sea of Japan,11.8,34.3,945,434.2,7.7,"Salmon,Cod,Pollock",Moderate Risk,18.9,Medium,7.8,67000,B+,24,Yes,1800,40.2,135.7,2024-04-01
Indian,Andaman Sea,28.1,33.8,1567,589.3,8.6,"Grouper,Snapper,Tuna",High Risk,42.1,High,7.7,23000,B-,27,Yes,1200,12.4,95.8,2024-04-05
Pacific,Gulf of Alaska,7.9,33.5,823,567.8,7.9,"Salmon,Halibut,Cod",Good,16.7,Medium,8.1,78000,A-,19,Yes,2500,58.7,-145.2,2024-04-10
Atlantic,Gulf of Mexico,23.4,36.1,1089,456.7,7.2,"Red Snapper,Grouper,Shrimp",High Risk,28.4,Medium,6.9,67000,C+,41,Yes,1600,26.8,-90.4,2024-04-15
Pacific,Tasman Sea,16.8,34.7,1234,623.1,8.1,"Barramundi,Flathead,Tuna",Moderate Risk,31.2,High,8.0,45000,B+,23,Yes,2800,-35.6,155.8,2024-04-20
Indian,Red Sea,26.7,40.1,1456,234.5,8.8,"Grouper,Parrotfish,Angelfish",Very High Risk,68.3,High,8.2,12000,B-,15,Yes,900,22.1,38.5,2024-04-25
Pacific,Philippine Sea,27.3,34.2,1789,734.6,9.1,"Tuna,Grouper,Snapper",High Risk,58.7,Very High,8.3,34000,B,26,Yes,4200,15.8,130.2,2024-05-01
Atlantic,Labrador Sea,4.1,34.1,567,289.4,6.9,"Cod,Shrimp,Crab",Moderate Risk,3.2,Low,7.6,45000,B+,38,Yes,3400,58.2,-55.7,2024-05-05
Pacific,Yellow Sea,14.2,31.5,678,345.8,7.3,"Hairtail,Croaker,Flounder",High Risk,12.8,Medium,6.8,89000,C+,45,Yes,800,36.5,123.4,2024-05-10
Indian,Persian Gulf,28.9,39.8,456,167.3,6.8,"Grouper,Emperor,Snapper",Critical Risk,15.7,Medium,6.5,23000,C,52,Yes,400,26.2,52.1,2024-05-15`;

// Initialize chatbot when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    loadOceanData();
    updateDataStats();
    initializeEventListeners();
    console.log('🤖 Ocean Data Chatbot initialized successfully!');
});

// ===== DATA LOADING AND PROCESSING =====
function loadOceanData() {
    oceanData = parseCSV(csvData);
    filteredData = [...oceanData];
    console.log('Loaded', oceanData.length, 'ocean data records');
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const record = {};
        headers.forEach((header, index) => {
            let value = values[index];
            if (value && !isNaN(value) && value !== '') {
                value = parseFloat(value);
            }
            record[header] = value;
        });
        return record;
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result.map(v => v.replace(/"/g, ''));
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Auto-suggest as user types
    messageInput.addEventListener('input', handleInputChange);
    
    // Handle suggestion clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-chip')) {
            messageInput.value = e.target.textContent;
            sendMessage();
        }
    });
}

// ===== MESSAGE HANDLING =====
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input and show typing indicator
    input.value = '';
    clearSuggestions();
    showTypingIndicator();
    
    // Process message and respond
    setTimeout(() => {
        hideTypingIndicator();
        processUserMessage(message);
    }, 1000 + Math.random() * 1000); // Simulate processing time
}

function askQuestion(question) {
    document.getElementById('messageInput').value = question;
    sendMessage();
}

function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-fish'}"></i>
        </div>
        <div class="message-content">
            ${content}
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===== TYPING INDICATOR =====
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-fish"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span>Aqua is analyzing data</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingMessage = document.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

// ===== MESSAGE PROCESSING AND AI RESPONSES =====
function processUserMessage(message) {
    const response = generateResponse(message);
    addMessage(response.text, 'bot');
    
    // Show visualization if applicable
    if (response.chart) {
        showVisualization(response.chart);
    }
}

function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Temperature queries
    if (lowerMessage.includes('temperature') || lowerMessage.includes('warm') || lowerMessage.includes('cold')) {
        return handleTemperatureQuery(lowerMessage);
    }
    
    // Biodiversity queries
    if (lowerMessage.includes('biodiversity') || lowerMessage.includes('species') || lowerMessage.includes('diversity')) {
        return handleBiodiversityQuery(lowerMessage);
    }
    
    // Conservation queries
    if (lowerMessage.includes('conservation') || lowerMessage.includes('endangered') || lowerMessage.includes('risk')) {
        return handleConservationQuery(lowerMessage);
    }
    
    // Fisheries queries
    if (lowerMessage.includes('fish') || lowerMessage.includes('fishing') || lowerMessage.includes('quota')) {
        return handleFisheriesQuery(lowerMessage);
    }
    
    // Ocean comparison queries
    if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
        return handleComparisonQuery(lowerMessage);
    }
    
    // General data queries
    if (lowerMessage.includes('show') || lowerMessage.includes('data') || lowerMessage.includes('table')) {
        return handleDataQuery(lowerMessage);
    }
    
    // Default response with suggestions
    return {
        text: `I can help you analyze ocean data! Here are some things you can ask me:
        
        <ul>
        <li><strong>Temperature:</strong> "What's the warmest ocean region?" or "Show temperature data"</li>
        <li><strong>Biodiversity:</strong> "Which areas have the most species?" or "Show biodiversity hotspots"</li>
        <li><strong>Conservation:</strong> "Which regions are at risk?" or "Show endangered species data"</li>
        <li><strong>Fisheries:</strong> "Compare fishing quotas" or "Show sustainable fishing ratings"</li>
        <li><strong>Comparisons:</strong> "Compare Pacific vs Atlantic" or "Show ocean differences"</li>
        </ul>
        
        Try being more specific about what ocean data you'd like to explore!`,
        chart: null
    };
}

// ===== SPECIFIC QUERY HANDLERS =====
function handleTemperatureQuery(query) {
    if (query.includes('warmest') || query.includes('hottest')) {
        const sortedByTemp = [...filteredData].sort((a, b) => b.Temperature_C - a.Temperature_C);
        const warmest = sortedByTemp.slice(0, 5);
        
        let response = `<p>🌡️ <strong>Warmest Ocean Regions:</strong></p><ol>`;
        warmest.forEach((region, index) => {
            response += `<li><strong>${region.Region}</strong> (${region.Ocean}): ${region.Temperature_C}°C</li>`;
        });
        response += `</ol><p>The ${warmest[0].Region} in the ${warmest[0].Ocean} is the warmest at ${warmest[0].Temperature_C}°C.</p>`;
        
        return {
            text: response,
            chart: {
                type: 'bar',
                title: 'Top 5 Warmest Regions',
                data: {
                    labels: warmest.map(r => r.Region),
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: warmest.map(r => r.Temperature_C),
                        backgroundColor: '#ef4444'
                    }]
                }
            }
        };
    }
    
    if (query.includes('coldest') || query.includes('coolest')) {
        const sortedByTemp = [...filteredData].sort((a, b) => a.Temperature_C - b.Temperature_C);
        const coldest = sortedByTemp.slice(0, 5);
        
        let response = `<p>🧊 <strong>Coldest Ocean Regions:</strong></p><ol>`;
        coldest.forEach((region, index) => {
            response += `<li><strong>${region.Region}</strong> (${region.Ocean}): ${region.Temperature_C}°C</li>`;
        });
        response += `</ol><p>The ${coldest[0].Region} in the ${coldest[0].Ocean} is the coldest at ${coldest[0].Temperature_C}°C.</p>`;
        
        return {
            text: response,
            chart: {
                type: 'bar',
                title: 'Top 5 Coldest Regions',
                data: {
                    labels: coldest.map(r => r.Region),
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: coldest.map(r => r.Temperature_C),
                        backgroundColor: '#3b82f6'
                    }]
                }
            }
        };
    }
    
    // Average temperature by ocean
    const avgTemps = calculateAveragesByOcean('Temperature_C');
    let response = `<p>🌊 <strong>Average Temperatures by Ocean:</strong></p><ul>`;
    Object.entries(avgTemps).forEach(([ocean, temp]) => {
        response += `<li><strong>${ocean}:</strong> ${temp.toFixed(1)}°C</li>`;
    });
    response += `</ul>`;
    
    return {
        text: response,
        chart: {
            type: 'doughnut',
            title: 'Average Temperature by Ocean',
            data: {
                labels: Object.keys(avgTemps),
                datasets: [{
                    data: Object.values(avgTemps).map(v => v.toFixed(1)),
                    backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b']
                }]
            }
        }
    };
}

function handleBiodiversityQuery(query) {
    if (query.includes('most species') || query.includes('highest diversity') || query.includes('biodiversity hotspot')) {
        const sortedBySpecies = [...filteredData].sort((a, b) => b.Fish_Species_Count - a.Fish_Species_Count);
        const topBiodiversity = sortedBySpecies.slice(0, 5);
        
        let response = `<p>🐠 <strong>Most Biodiverse Regions:</strong></p><ol>`;
        topBiodiversity.forEach((region, index) => {
            response += `<li><strong>${region.Region}</strong> (${region.Ocean}): ${region.Fish_Species_Count.toLocaleString()} species (Biodiversity Index: ${region.Biodiversity_Index})</li>`;
        });
        response += `</ol><p>The ${topBiodiversity[0].Region} leads with ${topBiodiversity[0].Fish_Species_Count.toLocaleString()} fish species!</p>`;
        
        return {
            text: response,
            chart: {
                type: 'bar',
                title: 'Top 5 Most Biodiverse Regions',
                data: {
                    labels: topBiodiversity.map(r => r.Region),
                    datasets: [{
                        label: 'Fish Species Count',
                        data: topBiodiversity.map(r => r.Fish_Species_Count),
                        backgroundColor: '#10b981'
                    }]
                }
            }
        };
    }
    
    // Average biodiversity by ocean
    const avgBiodiversity = calculateAveragesByOcean('Biodiversity_Index');
    let response = `<p>🌿 <strong>Biodiversity Index by Ocean:</strong></p><ul>`;
    Object.entries(avgBiodiversity).forEach(([ocean, index]) => {
        response += `<li><strong>${ocean}:</strong> ${index.toFixed(1)}/10</li>`;
    });
    response += `</ul><p>Higher scores indicate greater biodiversity.</p>`;
    
    return {
        text: response,
        chart: {
            type: 'radar',
            title: 'Biodiversity Index by Ocean',
            data: {
                labels: Object.keys(avgBiodiversity),
                datasets: [{
                    label: 'Biodiversity Index',
                    data: Object.values(avgBiodiversity).map(v => v.toFixed(1)),
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    borderWidth: 2
                }]
            }
        }
    };
}

function handleConservationQuery(query) {
    if (query.includes('endangered') || query.includes('risk')) {
        const criticalAreas = filteredData.filter(region => 
            region.Conservation_Status.includes('Critical') || 
            region.Conservation_Status.includes('Very High Risk')
        );
        
        const highRiskAreas = filteredData.filter(region => 
            region.Conservation_Status.includes('High Risk')
        );
        
        let response = `<p>⚠️ <strong>Conservation Status Overview:</strong></p>`;
        
        if (criticalAreas.length > 0) {
            response += `<p><strong>Critical/Very High Risk Areas (${criticalAreas.length}):</strong></p><ul>`;
            criticalAreas.forEach(region => {
                response += `<li><strong>${region.Region}</strong> (${region.Ocean}): ${region.Endangered_Species_Count} endangered species</li>`;
            });
            response += `</ul>`;
        }
        
        if (highRiskAreas.length > 0) {
            response += `<p><strong>High Risk Areas (${highRiskAreas.length}):</strong></p><ul>`;
            highRiskAreas.forEach(region => {
                response += `<li><strong>${region.Region}</strong> (${region.Ocean}): ${region.Endangered_Species_Count} endangered species</li>`;
            });
            response += `</ul>`;
        }
        
        const statusCounts = {};
        filteredData.forEach(region => {
            statusCounts[region.Conservation_Status] = (statusCounts[region.Conservation_Status] || 0) + 1;
        });
        
        return {
            text: response,
            chart: {
                type: 'pie',
                title: 'Conservation Status Distribution',
                data: {
                    labels: Object.keys(statusCounts),
                    datasets: [{
                        data: Object.values(statusCounts),
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#dc2626', '#7c2d12']
                    }]
                }
            }
        };
    }
    
    return { text: "Please be more specific about conservation data you'd like to see.", chart: null };
}

function handleFisheriesQuery(query) {
    if (query.includes('quota') || query.includes('fishing')) {
        const sortedByQuota = [...filteredData].sort((a, b) => b.Fishing_Quota_Tons - a.Fishing_Quota_Tons);
        const topQuotas = sortedByQuota.slice(0, 6);
        
        let response = `<p>🎣 <strong>Fishing Quotas by Region:</strong></p><ol>`;
        topQuotas.forEach((region, index) => {
            response += `<li><strong>${region.Region}</strong> (${region.Ocean}): ${region.Fishing_Quota_Tons.toLocaleString()} tons (Rating: ${region.Sustainable_Fishing_Rating})</li>`;
        });
        response += `</ol>`;
        
        return {
            text: response,
            chart: {
                type: 'bar',
                title: 'Top Fishing Quotas by Region',
                data: {
                    labels: topQuotas.map(r => r.Region),
                    datasets: [{
                        label: 'Fishing Quota (tons)',
                        data: topQuotas.map(r => r.Fishing_Quota_Tons),
                        backgroundColor: '#06b6d4'
                    }]
                }
            }
        };
    }
    
    return { text: "Please be more specific about fisheries data you'd like to see.", chart: null };
}

function handleComparisonQuery(query) {
    if (query.includes('pacific') && query.includes('atlantic')) {
        const pacificData = filteredData.filter(r => r.Ocean === 'Pacific');
        const atlanticData = filteredData.filter(r => r.Ocean === 'Atlantic');
        
        const pacificAvgs = {
            temperature: average(pacificData.map(r => r.Temperature_C)),
            biodiversity: average(pacificData.map(r => r.Biodiversity_Index)),
            species: average(pacificData.map(r => r.Fish_Species_Count))
        };
        
        const atlanticAvgs = {
            temperature: average(atlanticData.map(r => r.Temperature_C)),
            biodiversity: average(atlanticData.map(r => r.Biodiversity_Index)),
            species: average(atlanticData.map(r => r.Fish_Species_Count))
        };
        
        let response = `<p>🌊 <strong>Pacific vs Atlantic Comparison:</strong></p>
        <table class="data-table">
        <tr><th>Metric</th><th>Pacific</th><th>Atlantic</th></tr>
        <tr><td>Average Temperature</td><td>${pacificAvgs.temperature.toFixed(1)}°C</td><td>${atlanticAvgs.temperature.toFixed(1)}°C</td></tr>
        <tr><td>Average Biodiversity Index</td><td>${pacificAvgs.biodiversity.toFixed(1)}/10</td><td>${atlanticAvgs.biodiversity.toFixed(1)}/10</td></tr>
        <tr><td>Average Species Count</td><td>${Math.round(pacificAvgs.species).toLocaleString()}</td><td>${Math.round(atlanticAvgs.species).toLocaleString()}</td></tr>
        <tr><td>Number of Regions</td><td>${pacificData.length}</td><td>${atlanticData.length}</td></tr>
        </table>`;
        
        return {
            text: response,
            chart: {
                type: 'bar',
                title: 'Pacific vs Atlantic Comparison',
                data: {
                    labels: ['Temperature (°C)', 'Biodiversity Index', 'Species Count (hundreds)'],
                    datasets: [{
                        label: 'Pacific',
                        data: [pacificAvgs.temperature, pacificAvgs.biodiversity, pacificAvgs.species/100],
                        backgroundColor: '#3b82f6'
                    }, {
                        label: 'Atlantic',
                        data: [atlanticAvgs.temperature, atlanticAvgs.biodiversity, atlanticAvgs.species/100],
                        backgroundColor: '#06b6d4'
                    }]
                }
            }
        };
    }
    
    return { text: "Please specify which oceans or regions you'd like to compare.", chart: null };
}

function handleDataQuery(query) {
    const limitedData = filteredData.slice(0, 10);
    let response = `<p>📊 <strong>Ocean Data Sample (showing first 10 regions):</strong></p>
    <div style="overflow-x: auto;">
    <table class="data-table">
    <tr>
        <th>Region</th>
        <th>Ocean</th>
        <th>Temperature (°C)</th>
        <th>Species Count</th>
        <th>Biodiversity Index</th>
        <th>Conservation Status</th>
    </tr>`;
    
    limitedData.forEach(region => {
        response += `<tr>
        <td>${region.Region}</td>
        <td>${region.Ocean}</td>
        <td>${region.Temperature_C}</td>
        <td>${region.Fish_Species_Count.toLocaleString()}</td>
        <td>${region.Biodiversity_Index}</td>
        <td>${region.Conservation_Status}</td>
        </tr>`;
    });
    
    response += `</table></div><p>Total regions in dataset: ${filteredData.length}</p>`;
    
    return { text: response, chart: null };
}

// ===== UTILITY FUNCTIONS =====
function calculateAveragesByOcean(field) {
    const oceanGroups = {};
    
    filteredData.forEach(region => {
        if (!oceanGroups[region.Ocean]) {
            oceanGroups[region.Ocean] = [];
        }
        oceanGroups[region.Ocean].push(region[field]);
    });
    
    const averages = {};
    Object.keys(oceanGroups).forEach(ocean => {
        averages[ocean] = average(oceanGroups[ocean]);
    });
    
    return averages;
}

function average(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

// ===== AUTO-SUGGESTIONS =====
function handleInputChange(event) {
    const input = event.target.value.toLowerCase();
    if (input.length < 2) {
        clearSuggestions();
        return;
    }
    
    const suggestions = getSuggestions(input);
    displaySuggestions(suggestions);
}

function getSuggestions(input) {
    const commonQueries = [
        "What is the warmest ocean region?",
        "Show me biodiversity hotspots",
        "Which regions have the most fish species?",
        "Show conservation status by ocean",
        "Compare Pacific vs Atlantic data",
        "Show me endangered species data",
        "What's the coldest ocean region?",
        "Show fishing quotas by region",
        "Which areas are at highest risk?",
        "Show temperature data for all oceans",
        "What's the average biodiversity index?",
        "Show me coral coverage data",
        "Compare Indian Ocean vs Pacific",
        "Which regions have sustainable fishing?",
        "Show water quality data"
    ];
    
    return commonQueries.filter(query => 
        query.toLowerCase().includes(input)
    ).slice(0, 4);
}

function displaySuggestions(suggestions) {
    const container = document.getElementById('suggestions');
    container.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const chip = document.createElement('span');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        container.appendChild(chip);
    });
}

function clearSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}

// ===== DATA FILTERING =====
function applyFilters() {
    const oceanFilter = document.getElementById('oceanFilter').value;
    const tempFilter = document.getElementById('tempFilter').value;
    
    filteredData = [...oceanData];
    
    if (oceanFilter) {
        filteredData = filteredData.filter(region => region.Ocean === oceanFilter);
    }
    
    if (tempFilter) {
        filteredData = filteredData.filter(region => {
            const temp = region.Temperature_C;
            switch(tempFilter) {
                case 'cold': return temp <= 10;
                case 'moderate': return temp > 10 && temp <= 20;
                case 'warm': return temp > 20;
                default: return true;
            }
        });
    }
    
    updateDataStats();
    addMessage(`Filters applied! Now showing ${filteredData.length} regions. Ask me about the filtered data!`, 'bot');
}

function updateDataStats() {
    const totalRecords = filteredData.length;
    const avgTemp = average(filteredData.map(r => r.Temperature_C));
    const totalSpecies = filteredData.reduce((sum, r) => sum + r.Fish_Species_Count, 0);
    
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('avgTemp').textContent = avgTemp.toFixed(1) + '°C';
    document.getElementById('totalSpecies').textContent = totalSpecies.toLocaleString();
}

// ===== VISUALIZATION =====
function showVisualization(chartConfig) {
    const vizPanel = document.getElementById('vizPanel');
    const canvas = document.getElementById('dynamicChart');
    
    vizPanel.style.display = 'flex';
    
    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Create new chart
    chartInstance = new Chart(canvas, {
        type: chartConfig.type,
        data: chartConfig.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartConfig.title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function closeVizPanel() {
    document.getElementById('vizPanel').style.display = 'none';
}

// ===== UTILITY FUNCTIONS =====
function clearChat() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
        <div class="message bot-message">
            <div class="message-avatar">
                <i class="fas fa-fish"></i>
            </div>
            <div class="message-content">
                <p>Chat cleared! I'm Aqua 🐙 How can I help you analyze ocean data today?</p>
            </div>
            <div class="message-time">Just now</div>
        </div>
    `;
}

function downloadData() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Region,Ocean,Temperature,Species Count,Biodiversity Index,Conservation Status\n" +
        filteredData.map(r => 
            `"${r.Region}","${r.Ocean}",${r.Temperature_C},${r.Fish_Species_Count},${r.Biodiversity_Index},"${r.Conservation_Status}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ocean_data_filtered.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addMessage("Data download started! Check your downloads folder for 'ocean_data_filtered.csv'", 'bot');
}