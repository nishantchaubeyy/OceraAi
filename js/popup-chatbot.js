/*===== POPUP CHATBOT FUNCTIONALITY =====*/

// Global variables for popup chatbot
let popupChartInstance = null;
let isPopupMinimized = false;

// Load ocean data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMainPageData();
    console.log('🤖 Popup Chatbot initialized on all pages!');
});

// ===== POPUP CHATBOT CONTROLS =====
function toggleChatbot() {
    const popup = document.getElementById('chatbotPopup');
    const floatBtn = document.getElementById('chatbotFloat');
    
    if (popup.classList.contains('active')) {
        closeChatbot();
    } else {
        popup.classList.add('active');
        floatBtn.style.display = 'none';
        
        // Focus input after opening
        setTimeout(() => {
            document.getElementById('popupMessageInput').focus();
        }, 300);
    }
}

function closeChatbot() {
    const popup = document.getElementById('chatbotPopup');
    const floatBtn = document.getElementById('chatbotFloat');
    
    popup.classList.remove('active');
    popup.classList.remove('minimized');
    floatBtn.style.display = 'flex';
    isPopupMinimized = false;
}

function minimizeChatbot() {
    const popup = document.getElementById('chatbotPopup');
    
    if (isPopupMinimized) {
        popup.classList.remove('minimized');
        isPopupMinimized = false;
    } else {
        popup.classList.add('minimized');
        isPopupMinimized = true;
    }
}

function openChatbot() {
    const popup = document.getElementById('chatbotPopup');
    const floatBtn = document.getElementById('chatbotFloat');
    
    popup.classList.add('active');
    popup.classList.remove('minimized');
    floatBtn.style.display = 'none';
    isPopupMinimized = false;
    
    setTimeout(() => {
        document.getElementById('popupMessageInput').focus();
    }, 300);
}

function openChatbotWith(message) {
    openChatbot();
    
    // Wait for popup to open then send message
    setTimeout(() => {
        const input = document.getElementById('popupMessageInput');
        input.value = message;
        sendPopupMessage();
    }, 500);
}

// ===== MESSAGE HANDLING FOR POPUP =====
function handlePopupKeyPress(event) {
    if (event.key === 'Enter') {
        sendPopupMessage();
    }
}

function sendPopupMessage(predefinedMessage) {
    const input = document.getElementById('popupMessageInput');
    const message = predefinedMessage || input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addPopupMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    showPopupTyping();
    
    // Process message
    setTimeout(() => {
        hidePopupTyping();
        processPopupMessage(message);
    }, 1000 + Math.random() * 1000);
}

function addPopupMessage(content, sender) {
    const messagesContainer = document.getElementById('popupChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-fish'}"></i>
        </div>
        <div class="message-content">
            ${content}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollPopupToBottom();
}

function scrollPopupToBottom() {
    const messagesContainer = document.getElementById('popupChatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showPopupTyping() {
    const messagesContainer = document.getElementById('popupChatMessages');
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
    scrollPopupToBottom();
}

function hidePopupTyping() {
    const typingMessage = document.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

function processPopupMessage(message) {
    const response = generateResponse(message);
    addPopupMessage(response.text, 'bot');
    
    // Show visualization if applicable
    if (response.chart) {
        showPopupVisualization(response.chart);
    }
}

// ===== VISUALIZATION FOR POPUP =====
function showPopupVisualization(chartConfig) {
    const vizPanel = document.getElementById('popupVizPanel');
    const canvas = document.getElementById('popupChart');
    
    vizPanel.style.display = 'block';
    
    // Destroy existing chart
    if (popupChartInstance) {
        popupChartInstance.destroy();
    }
    
    // Create new chart
    popupChartInstance = new Chart(canvas, {
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
                        size: 12,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            scales: chartConfig.type !== 'doughnut' && chartConfig.type !== 'pie' ? {
                x: {
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                }
            } : {}
        }
    });
}

function closePopupViz() {
    document.getElementById('popupVizPanel').style.display = 'none';
}

// ===== MAIN PAGE DATA LOADING =====
function loadMainPageData() {
    // Load sample data into the main page table
    if (typeof oceanData !== 'undefined' && oceanData.length > 0) {
        updateMainPageStats();
        loadSampleDataTable();
    } else {
        // If oceanData is not available, load it from the embedded CSV
        if (typeof loadOceanData === 'function') {
            loadOceanData();
            setTimeout(() => {
                updateMainPageStats();
                loadSampleDataTable();
            }, 100);
        } else {
            // Fallback: load data directly
            loadFallbackData();
        }
    }
}

function updateMainPageStats() {
    const totalRecords = document.getElementById('mainTotalRegions');
    const avgTemp = document.getElementById('mainAvgTemp');
    const totalSpecies = document.getElementById('mainTotalSpecies');
    
    if (totalRecords && typeof oceanData !== 'undefined' && oceanData.length > 0) {
        const avgTemperature = oceanData.reduce((sum, r) => sum + r.Temperature_C, 0) / oceanData.length;
        const totalSpeciesCount = oceanData.reduce((sum, r) => sum + r.Fish_Species_Count, 0);
        
        totalRecords.textContent = oceanData.length;
        avgTemp.textContent = avgTemperature.toFixed(1) + '°C';
        totalSpecies.textContent = totalSpeciesCount.toLocaleString();
    }
}

function loadSampleDataTable() {
    const tableBody = document.getElementById('oceanDataBody');
    if (!tableBody || typeof oceanData === 'undefined') return;
    
    const sampleData = oceanData.slice(0, 8); // Show first 8 rows
    
    tableBody.innerHTML = '';
    sampleData.forEach(region => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${region.Region}</td>
            <td>${region.Ocean}</td>
            <td>${region.Temperature_C}°C</td>
            <td>${region.Fish_Species_Count.toLocaleString()}</td>
            <td>${region.Biodiversity_Index}/10</td>
            <td><span class="status-badge ${getStatusClass(region.Conservation_Status)}">${region.Conservation_Status}</span></td>
            <td>${region.Fishing_Quota_Tons.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusClass(status) {
    if (status.includes('Good')) return 'status-good';
    if (status.includes('High Risk') || status.includes('Very High Risk')) return 'status-high-risk';
    if (status.includes('Critical')) return 'status-critical';
    return 'status-moderate';
}

function showAllData() {
    const tableBody = document.getElementById('oceanDataBody');
    if (!tableBody || typeof oceanData === 'undefined') return;
    
    tableBody.innerHTML = '';
    oceanData.forEach(region => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${region.Region}</td>
            <td>${region.Ocean}</td>
            <td>${region.Temperature_C}°C</td>
            <td>${region.Fish_Species_Count.toLocaleString()}</td>
            <td>${region.Biodiversity_Index}/10</td>
            <td><span class="status-badge ${getStatusClass(region.Conservation_Status)}">${region.Conservation_Status}</span></td>
            <td>${region.Fishing_Quota_Tons.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Scroll to table
    document.getElementById('oceanDataTable').scrollIntoView({ behavior: 'smooth' });
}

function loadFallbackData() {
    // Fallback ocean data for main page
    window.oceanData = [
        {
            Region: "Coral Triangle", Ocean: "Pacific", Temperature_C: 28.5, 
            Fish_Species_Count: 2847, Biodiversity_Index: 9.8, 
            Conservation_Status: "Very High Risk", Fishing_Quota_Tons: 45000
        },
        {
            Region: "North Pacific", Ocean: "Pacific", Temperature_C: 12.5, 
            Fish_Species_Count: 1547, Biodiversity_Index: 8.7, 
            Conservation_Status: "Moderate Risk", Fishing_Quota_Tons: 125000
        },
        {
            Region: "Caribbean Sea", Ocean: "Atlantic", Temperature_C: 25.9, 
            Fish_Species_Count: 1234, Biodiversity_Index: 8.4, 
            Conservation_Status: "High Risk", Fishing_Quota_Tons: 28000
        },
        {
            Region: "Red Sea", Ocean: "Indian", Temperature_C: 26.7, 
            Fish_Species_Count: 1456, Biodiversity_Index: 8.8, 
            Conservation_Status: "Very High Risk", Fishing_Quota_Tons: 12000
        },
        {
            Region: "Arctic Ocean", Ocean: "Arctic", Temperature_C: 1.2, 
            Fish_Species_Count: 456, Biodiversity_Index: 6.2, 
            Conservation_Status: "Critical Risk", Fishing_Quota_Tons: 15000
        },
        {
            Region: "Norwegian Sea", Ocean: "Atlantic", Temperature_C: 6.2, 
            Fish_Species_Count: 678, Biodiversity_Index: 7.6, 
            Conservation_Status: "Good", Fishing_Quota_Tons: 89000
        }
    ];
    
    updateMainPageStats();
    loadSampleDataTable();
}

// ===== ADD STATUS BADGE STYLES =====
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-full);
            font-size: var(--smaller-size);
            font-weight: var(--font-medium);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .status-good {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-moderate {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-high-risk {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .status-critical {
            background: #fecaca;
            color: #991b1b;
        }
    `;
    document.head.appendChild(style);
});

// ===== DRAG FUNCTIONALITY FOR POPUP =====
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let popupStartX = 0;
let popupStartY = 0;

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.chatbot-header');
    const popup = document.getElementById('chatbotPopup');
    
    if (header && popup) {
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
});

function startDrag(e) {
    if (e.target.closest('.chatbot-actions')) return; // Don't drag when clicking buttons
    
    isDragging = true;
    const popup = document.getElementById('chatbotPopup');
    const rect = popup.getBoundingClientRect();
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    popupStartX = rect.left;
    popupStartY = rect.top;
    
    popup.style.transition = 'none';
}

function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const popup = document.getElementById('chatbotPopup');
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    let newX = popupStartX + deltaX;
    let newY = popupStartY + deltaY;
    
    // Keep popup within viewport bounds
    const maxX = window.innerWidth - popup.offsetWidth;
    const maxY = window.innerHeight - popup.offsetHeight;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    popup.style.left = newX + 'px';
    popup.style.top = newY + 'px';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
}

function stopDrag() {
    isDragging = false;
    const popup = document.getElementById('chatbotPopup');
    if (popup) {
        popup.style.transition = '';
    }
}

// ===== CLOSE POPUP WHEN CLICKING OUTSIDE =====
document.addEventListener('click', function(e) {
    const popup = document.getElementById('chatbotPopup');
    const floatBtn = document.getElementById('chatbotFloat');
    
    if (popup && popup.classList.contains('active') && 
        !popup.contains(e.target) && 
        !floatBtn.contains(e.target)) {
        // Don't close if clicking on cards that open chatbot
        if (!e.target.closest('[onclick*="openChatbotWith"]')) {
            closeChatbot();
        }
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Open chatbot with Ctrl+/ or Cmd+/
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const popup = document.getElementById('chatbotPopup');
        if (!popup.classList.contains('active')) {
            openChatbot();
        }
    }
    
    // Close chatbot with Escape
    if (e.key === 'Escape') {
        const popup = document.getElementById('chatbotPopup');
        if (popup && popup.classList.contains('active')) {
            closeChatbot();
        }
    }
});