# Quick Start Guide: Marine Datasets

## 🚀 Getting Started

### Step 1: Load Sample Data
1. Go to **Settings** in your Marine Platform
2. Scroll to **Marine Datasets** section
3. Click **"Load Sample Data"** to get started with pre-loaded marine species information

### Step 2: Upload Your Own Datasets
1. Prepare your CSV or JSON files with marine data
2. Use the **drag-and-drop area** or click **"Choose Dataset Files"**
3. Supported formats:
   - **CSV**: Must have headers in first row
   - **JSON**: Array of objects with species information

### Step 3: Test the Enhanced Chat
1. After loading datasets, ask questions like:
   - "Tell me about great white sharks"
   - "What fish live in coral reefs?"
   - "Show me endangered marine species"
2. The chatbot will now use your dataset information for more accurate responses!

## 📊 Recommended Data Sources

### NOAA (National Oceanic and Atmospheric Administration)
- **Website**: https://www.fisheries.noaa.gov/
- **Data**: Species profiles, fisheries data, protected species
- **Format**: Usually CSV or Excel (convert to CSV)

### OBIS (Ocean Biodiversity Information System)
- **Website**: https://obis.org/
- **Data**: Global marine biodiversity data
- **Format**: CSV downloads available
- **API**: https://api.obis.org/

### FishBase
- **Website**: https://www.fishbase.org/
- **Data**: Comprehensive fish database
- **Export**: Available in various formats

### WoRMS (World Register of Marine Species)
- **Website**: https://www.marinespecies.org/
- **Data**: Taxonomic and nomenclatural information
- **API**: Available for bulk downloads

## 📋 Required Data Fields

### Minimum Required (for best results):
- `species_name` - Common name
- `scientific_name` - Scientific name

### Recommended Additional Fields:
- `habitat` - Where the species lives
- `depth_range` - Depth range (e.g., "0-100m")
- `temperature_range` - Temperature range
- `distribution` - Geographic distribution
- `conservation_status` - IUCN status
- `diet` - What they eat
- `size` - Size information
- `characteristics` - Key features

## 🔧 Data Format Examples

### CSV Format:
```csv
species_name,scientific_name,habitat,depth_range,conservation_status
Great White Shark,Carcharodon carcharias,Coastal waters,0-1200m,Vulnerable
Blue Whale,Balaenoptera musculus,Open ocean,0-500m,Endangered
```

### JSON Format:
```json
[
  {
    "species_name": "Great White Shark",
    "scientific_name": "Carcharodon carcharias",
    "habitat": "Coastal waters",
    "depth_range": "0-1200m",
    "conservation_status": "Vulnerable",
    "characteristics": ["Apex predator", "Excellent sense of smell"]
  }
]
```

## 🎯 Tips for Best Results

1. **Use consistent naming**: Keep field names consistent across datasets
2. **Include scientific names**: These help with accurate species matching
3. **Add detailed characteristics**: More details = better chatbot responses
4. **Validate your data**: Use the "Validate Data" button to check format
5. **Start small**: Test with a few species first, then add more data

## 🔍 How It Works

1. **Upload**: Your datasets are stored locally in your browser
2. **Index**: The system creates a searchable index of species and keywords
3. **Search**: When you ask questions, it searches your datasets first
4. **Enhance**: The AI combines dataset information with its knowledge
5. **Respond**: You get more accurate, data-driven responses

## 🛠️ Troubleshooting

### Dataset Not Loading?
- Check file format (CSV/JSON only)
- Ensure proper headers in CSV files
- Validate JSON syntax

### Chat Not Using Dataset?
- Make sure datasets are loaded (check "Loaded Datasets" section)
- Try specific species names from your dataset
- Use the "Validate Data" button to check dataset health

### Performance Issues?
- Large datasets (>1000 records) may slow down the browser
- Consider splitting large datasets into smaller files
- Clear old datasets you no longer need

## 📞 Need Help?

If you encounter issues:
1. Use the "Check Storage" button in Settings
2. Try the "Validate Data" function
3. Check the browser console for error messages
4. Start with the sample datasets to test functionality

Happy marine data exploration! 🌊🐠