# 🌊 Marine Species Identification Platform

A full-stack web application that uses AI to identify marine species from uploaded images and provides an intelligent chatbot for marine biology questions.

## Features

- **AI-Powered Species Identification**: Upload marine life images for automatic species identification using Google Gemini AI
- **Interactive Chat Assistant**: Chat with "Aqua", an AI assistant specialized in marine biology
- **Database Storage**: Persistent storage of identifications and chat history using SQLite
- **File Upload**: Secure file upload with validation and storage
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Results**: Instant analysis and feedback

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **AI Integration**: Google Gemini API
- **File Upload**: Multer
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Google Gemini API key

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd marine-species-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the `.env` file and update with your API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the application**
   - Open your browser and go to `http://localhost:3000`
   - Open `marine_prototype_updated.html` in your browser

## API Endpoints

### File Upload
- **POST** `/api/upload`
  - Upload and analyze marine species images
  - Accepts: multipart/form-data with 'image' field
  - Returns: Analysis results and file information

### Image Analysis
- **POST** `/api/analyze-image`
  - Analyze base64 encoded images
  - Body: `{ imageBase64: string, mimeType: string }`
  - Returns: Species identification results

### Chat
- **POST** `/api/chat`
  - Chat with Aqua AI assistant
  - Body: `{ message: string }`
  - Returns: AI response

### Data Retrieval
- **GET** `/api/recent-identifications` - Get recent species identifications
- **GET** `/api/chat-history` - Get recent chat messages

## Database Schema

### species_identifications
- `id` - Primary key
- `filename` - Uploaded file name
- `common_name` - Common species name
- `scientific_name` - Scientific species name
- `description` - Species description
- `confidence_score` - AI confidence level
- `created_at` - Timestamp

### chat_history
- `id` - Primary key
- `message` - User message
- `response` - AI response
- `created_at` - Timestamp

## Security Features

- Environment variable protection for API keys
- File type validation (images only)
- File size limits (10MB max)
- Input validation and sanitization
- Error handling and logging

## Usage

1. **Upload Images**: Drag and drop or click to upload marine life images
2. **View Results**: See AI-generated species identification with details
3. **Chat with Aqua**: Ask questions about marine biology, species, ecosystems
4. **Browse History**: View recent identifications and chat history

## File Structure

```
marine-species-platform/
├── server.js              # Main server file
├── marine_prototype_updated.html  # Frontend interface
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── uploads/              # Uploaded images (created automatically)
└── marine_species.db     # SQLite database (created automatically)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Note**: Make sure to keep your Gemini API key secure and never commit it to version control. The `.env` file is included in `.gitignore` for this reason.