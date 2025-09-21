// Enhanced chat functionality with dataset integration
// This script enhances the chatbot to use uploaded datasets for more accurate responses

// Override the original sendMessage function to include dataset search
const originalSendMessage = window.sendMessage;

window.sendMessage = async function() {
    const message = chatInput.value.trim();
    if (!message) return;

    if (message.length > 1000) {
        addMessageToChat('Message too long. Please keep it under 1000 characters.', 'bot');
        return;
    }

    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    sendBtn.disabled = true;

    try {
        if (!GEMINI_API_KEY) {
            addMessageToChat('Please configure your Gemini API key first to use the chat feature. Go to Settings to add your API key.', 'bot');
            sendBtn.disabled = false;
            return;
        }

        // Search datasets for relevant information
        const datasetResults = searchDatasets(message);
        let contextInfo = '';
        
        if (datasetResults.length > 0) {
            contextInfo = '\n\nRelevant information from your datasets:\n';
            datasetResults.forEach((result, index) => {
                contextInfo += `\n${index + 1}. ${result.species_name || result.scientific_name}`;
                if (result.scientific_name && result.species_name) {
                    contextInfo += ` (${result.scientific_name})`;
                }
                if (result.habitat) contextInfo += `\n   Habitat: ${result.habitat}`;
                if (result.depth_range) contextInfo += `\n   Depth: ${result.depth_range}`;
                if (result.distribution) contextInfo += `\n   Distribution: ${result.distribution}`;
                if (result.conservation_status) contextInfo += `\n   Status: ${result.conservation_status}`;
                if (result.diet) contextInfo += `\n   Diet: ${result.diet}`;
                if (result.characteristics) {
                    const chars = Array.isArray(result.characteristics) ? 
                        result.characteristics.join(', ') : result.characteristics;
                    contextInfo += `\n   Characteristics: ${chars}`;
                }
                contextInfo += '\n';
            });
        }

        // Enhanced prompt with dataset context
        const enhancedMessage = message + contextInfo;
        
        const payload = {
            contents: [{ parts: [{ text: enhancedMessage }] }],
            systemInstruction: {
                parts: [{ 
                    text: `You are Aqua, a knowledgeable marine biology AI assistant. You help users identify marine species, provide information about ocean life, marine ecosystems, conservation, and answer questions about marine biology. 

When provided with dataset information, use it to give more accurate and detailed responses. Always prioritize the dataset information when it's available, as it comes from reliable sources like NOAA and OBIS.

If dataset information is provided, reference it in your response and explain how it relates to the user's question. Keep responses informative but concise.

Dataset sources may include:
- NOAA (National Oceanic and Atmospheric Administration)
- OBIS (Ocean Biodiversity Information System)  
- FishBase (Global fish database)
- WoRMS (World Register of Marine Species)` 
                }]
            },
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API failed with status ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            // Add indicator if dataset information was used
            let responseText = text;
            if (datasetResults.length > 0) {
                responseText += `\n\n📊 *Response enhanced with data from ${datasetResults.length} dataset record(s)*`;
            }
            
            addMessageToChat(responseText, 'bot');
            saveChatMessage(message, responseText);
        } else {
            addMessageToChat('Sorry, I didn\'t receive a proper response.', 'bot');
        }

    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('Sorry, I\'m having trouble connecting. Please check your API key and try again.', 'bot');
    } finally {
        sendBtn.disabled = false;
    }
};

// Enhanced species identification with dataset cross-reference
const originalAnalyzeImageWithGemini = window.analyzeImageWithGemini;

window.analyzeImageWithGemini = async function(imageBase64, mimeType) {
    const payload = {
        contents: [{
            parts: [
                {
                    text: `Identify the marine species in this image. Please provide your response in the following JSON format:
                {
                    "commonName": "Common name of the species",
                    "scientificName": "Scientific name",
                    "description": "Brief description of the species",
                    "confidence": 0.85,
                    "habitat": "Where it's typically found",
                    "characteristics": ["key feature 1", "key feature 2"]
                }

After identification, I will cross-reference this with uploaded datasets for additional information.` 
                },
                { inlineData: { mimeType: mimeType, data: imageBase64 } }
            ]
        }],
    };

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    let analysis;
    try {
        // Try to parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.log("Failed to parse JSON, using text response");
        analysis = {
            commonName: "Unknown",
            scientificName: "Unknown",
            description: text,
            confidence: 0.5
        };
    }

    // Cross-reference with datasets
    if (analysis.commonName || analysis.scientificName) {
        const searchQuery = `${analysis.commonName || ''} ${analysis.scientificName || ''}`.trim();
        const datasetMatches = searchDatasets(searchQuery);
        
        if (datasetMatches.length > 0) {
            const match = datasetMatches[0]; // Use best match
            
            // Enhance analysis with dataset information
            analysis.datasetMatch = true;
            analysis.datasetSource = 'User Dataset';
            
            // Merge information, preferring dataset data for accuracy
            if (match.habitat && !analysis.habitat) analysis.habitat = match.habitat;
            if (match.depth_range) analysis.depth_range = match.depth_range;
            if (match.distribution) analysis.distribution = match.distribution;
            if (match.conservation_status) analysis.conservation_status = match.conservation_status;
            if (match.diet) analysis.diet = match.diet;
            if (match.size) analysis.size = match.size;
            if (match.weight) analysis.weight = match.weight;
            if (match.lifespan) analysis.lifespan = match.lifespan;
            if (match.threats) analysis.threats = match.threats;
            if (match.interesting_facts) analysis.interesting_facts = match.interesting_facts;
            
            // Merge characteristics
            if (match.characteristics) {
                const existingChars = analysis.characteristics || [];
                const newChars = Array.isArray(match.characteristics) ? 
                    match.characteristics : [match.characteristics];
                analysis.characteristics = [...new Set([...existingChars, ...newChars])];
            }
            
            // Increase confidence if we have a dataset match
            if (analysis.confidence < 0.9) {
                analysis.confidence = Math.min(0.95, analysis.confidence + 0.2);
            }
        }
    }

    return analysis;
};

// Enhanced result display to show dataset information
const originalDisplayResult = window.displayResult;

window.displayResult = function(result) {
    const analysis = result.analysis;
    let resultHTML = `
        <div class="result-item">
            <img src="${result.fileUrl}" alt="Uploaded marine species" class="result-image">
            <div class="result-info">
                <h3>${analysis.commonName || 'Unknown Species'}</h3>
                <p class="scientific-name">${analysis.scientificName || 'Scientific name not identified'}</p>
                <p><strong>Description:</strong> ${analysis.description || 'No description available'}</p>
                ${analysis.habitat ? `<p><strong>Habitat:</strong> ${analysis.habitat}</p>` : ''}
                ${analysis.depth_range ? `<p><strong>Depth Range:</strong> ${analysis.depth_range}</p>` : ''}
                ${analysis.distribution ? `<p><strong>Distribution:</strong> ${analysis.distribution}</p>` : ''}
                ${analysis.conservation_status ? `<p><strong>Conservation Status:</strong> ${analysis.conservation_status}</p>` : ''}
                ${analysis.diet ? `<p><strong>Diet:</strong> ${analysis.diet}</p>` : ''}
                ${analysis.size ? `<p><strong>Size:</strong> ${analysis.size}</p>` : ''}
                ${analysis.weight ? `<p><strong>Weight:</strong> ${analysis.weight}</p>` : ''}
                ${analysis.lifespan ? `<p><strong>Lifespan:</strong> ${analysis.lifespan}</p>` : ''}
                ${analysis.characteristics ? `<p><strong>Key Features:</strong> ${analysis.characteristics.join(', ')}</p>` : ''}
                ${analysis.threats ? `<p><strong>Threats:</strong> ${Array.isArray(analysis.threats) ? analysis.threats.join(', ') : analysis.threats}</p>` : ''}
                ${analysis.confidence ? `<p><strong>Confidence:</strong> ${Math.round(analysis.confidence * 100)}%</p>` : ''}
                <p><strong>Analyzed:</strong> ${new Date(result.timestamp).toLocaleDateString()}</p>
                ${analysis.datasetMatch ? '<p style="color: var(--accent-green); font-size: var(--small-size);"><i class="fas fa-database"></i> Enhanced with dataset information</p>' : ''}
            </div>
        </div>
    `;
    
    // Show interesting facts if available
    if (analysis.interesting_facts && analysis.interesting_facts.length > 0) {
        resultHTML += `
            <div style="margin-top: var(--spacing-md); padding: var(--spacing-md); background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border-left: 4px solid var(--accent-green);">
                <h4 style="color: var(--accent-green); margin-bottom: var(--spacing-sm);"><i class="fas fa-lightbulb"></i> Interesting Facts:</h4>
                <ul style="margin-left: var(--spacing-lg); color: var(--text-secondary);">
                    ${analysis.interesting_facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = resultHTML + resultsContainer.innerHTML;
};

console.log('🐠 Dataset-enhanced chat functionality loaded!');