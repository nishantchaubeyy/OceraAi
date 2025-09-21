# 🌊 Data Ingestion Portal

A comprehensive data ingestion system for marine species datasets from NOAA, OBIS, and custom sources.

## Features

### 🔄 Data Upload & Processing
- **Multi-format Support**: Upload CSV and JSON files up to 50MB
- **Intelligent Parsing**: Automatically detects and normalizes different data schemas
- **Source Validation**: Supports NOAA, OBIS, and custom dataset formats
- **Asynchronous Processing**: Files are processed in the background with status tracking

### 📊 Data Management
- **Dataset Overview**: View all uploaded datasets with filtering by source and status
- **Record Preview**: Browse dataset contents with pagination and search
- **Processing Logs**: Detailed logs for troubleshooting and monitoring
- **Export Options**: Export processed data as CSV or JSON

### 🔍 Search & Analytics
- **Global Search**: Search across all datasets by species name, habitat, location
- **Advanced Filtering**: Filter by data source, conservation status, and more
- **Statistics Dashboard**: View dataset statistics and analytics
- **Real-time Updates**: Live status updates during processing

## API Endpoints

### Data Ingestion
- `POST /api/datasets/upload` - Upload dataset files
- `GET /api/datasets` - List all datasets with filtering
- `GET /api/datasets/:id` - Get dataset details with records preview
- `DELETE /api/datasets/:id` - Delete a dataset

### Data Access
- `GET /api/datasets/:id/records` - Get dataset records with pagination
- `GET /api/datasets/:id/export` - Export dataset (CSV/JSON)
- `GET /api/datasets/:id/logs` - Get processing logs
- `GET /api/search` - Search across all datasets
- `GET /api/datasets/statistics` - Get platform statistics

## Supported Data Formats

### NOAA Format (CSV)
```csv
species_name,scientific_name,habitat,depth_range,temperature_range,distribution,conservation_status,diet,size,weight,latitude,longitude,observation_date
Atlantic Bluefin Tuna,Thunnus thynnus,Open ocean,0-1000m,3-30°C,North Atlantic Ocean,Endangered,Fish and squid,2-4m,150-650kg,42.5,-70.2,2024-01-15
```

### OBIS Format (JSON)
```json
[
  {
    "scientificName": "Chelonia mydas",
    "common_name": "Green Sea Turtle",
    "habitat": "Coastal waters and coral reefs",
    "decimalLatitude": 25.7617,
    "decimalLongitude": -80.1918,
    "depth": "0-40m",
    "eventDate": "2024-01-12",
    "temperature": "22-30°C",
    "distribution": "Tropical and subtropical waters worldwide",
    "iucn_status": "Endangered"
  }
]
```

### Custom Format
The system intelligently maps various field names to standardized schema:
- Species names: `species_name`, `common_name`, `name`
- Scientific names: `scientific_name`, `scientificName`, `binomial`
- Coordinates: `latitude`/`longitude`, `lat`/`lng`, `decimalLatitude`/`decimalLongitude`
- And many more flexible mappings...

## Database Schema

### Datasets Table
- Metadata about uploaded datasets
- Processing status tracking
- File information and statistics

### Dataset Records Table
- Normalized species data from all sources
- Standardized field structure
- Geographic coordinates and temporal data
- Raw data preservation for reference

### Processing Logs Table
- Detailed processing information
- Error tracking and debugging
- Processing statistics and performance metrics

## Usage Instructions

### 1. Start the Server
```bash
npm install
npm start
```

### 2. Access the Portal
Open your browser to: `http://localhost:3000/data-ingestion-portal.html`

### 3. Upload Data
1. Click "Upload Dataset" tab
2. Drag & drop or select your CSV/JSON file
3. Fill in dataset name and source
4. Click "Upload Dataset"

### 4. Monitor Processing
- View processing status in "Manage Datasets" tab
- Check logs for detailed processing information
- Watch real-time status updates

### 5. Explore Data
- Use "Search Data" to find specific species or locations
- View "Analytics" for dataset statistics
- Export processed data for external use

## Data Quality Features

### Validation
- File format validation
- Schema compatibility checking
- Data type validation
- Geographic coordinate validation

### Normalization
- Standardized field mapping
- Unit conversion where applicable
- Data cleaning and sanitization
- Duplicate detection

### Error Handling
- Graceful handling of malformed data
- Detailed error reporting
- Partial success processing
- Recovery mechanisms

## Integration

The data ingestion portal integrates seamlessly with your existing marine species platform:

1. **Database Integration**: Uses the same SQLite database
2. **API Compatibility**: REST endpoints follow existing patterns  
3. **UI Consistency**: Matches your existing platform design
4. **Data Sharing**: Ingested data is available to other platform features

## Sample Data

Test the system with the provided sample datasets:
- `datasets/sample_noaa_dataset.csv` - NOAA format example
- `datasets/sample_obis_dataset.json` - OBIS format example

## Security

- File type validation (CSV/JSON only)
- File size limits (50MB maximum)
- SQL injection protection
- Input sanitization
- Error handling without data exposure

## Performance

- Asynchronous file processing
- Chunked data insertion
- Database transaction optimization
- Efficient pagination for large datasets
- Memory-conscious parsing for large files

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file format (CSV/JSON only)
   - Verify file size (under 50MB)
   - Ensure dataset name is provided

2. **Processing Stuck**
   - Check processing logs for errors
   - Verify data format matches expected schema
   - Review server console for detailed errors

3. **Data Not Appearing**
   - Check processing status is "processed"
   - Refresh the datasets list
   - Verify database permissions

### Log Locations
- Processing logs: Available through the web interface
- Server logs: Console output
- Database: `marine_species.db` file

## Contributing

When extending the data ingestion system:

1. Update field mappings in `normalizeSpeciesData()` function
2. Add new validation rules in data parsing functions
3. Update the frontend interface for new features
4. Test with various data formats and edge cases

## Future Enhancements

- Batch upload support for multiple files
- Scheduled data imports from external APIs
- Data versioning and change tracking
- Advanced data visualization
- Machine learning-based data quality scoring
- Integration with external taxonomic databases