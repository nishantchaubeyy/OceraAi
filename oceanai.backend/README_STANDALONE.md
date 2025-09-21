# 🌊 Marine Species Identification Platform (Standalone)

A client-side web application that uses Google Gemini AI to identify marine species from uploaded images and provides an intelligent chatbot for marine biology questions.

## ✨ Features

- **AI-Powered Species Identification**: Upload marine life images for automatic species identification
- **Interactive Chat Assistant**: Chat with "Aqua", an AI assistant specialized in marine biology
- **Local Storage**: Saves your identifications and chat history in your browser
- **No Backend Required**: Runs entirely in your browser
- **GitHub Pages Ready**: Can be hosted directly on GitHub Pages

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. **Fork this repository** or create a new repository
2. **Upload the `marine_prototype_updated.html` file** to your repository
3. **Enable GitHub Pages** in your repository settings
4. **Visit your GitHub Pages URL** to access the application

### Option 2: Local Usage

1. **Download** the `marine_prototype_updated.html` file
2. **Open** the file in any modern web browser
3. **Get your Gemini API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Enter your API key** in the configuration section
5. **Start uploading images** and chatting with Aqua!

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it into the configuration section of the app

**Note**: The API key is stored locally in your browser and never sent anywhere except to Google's Gemini API.

## 🖼️ Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- Maximum file size: 4MB (browser limitation)

## 💾 Data Storage

- All data is stored locally in your browser using localStorage
- No data is sent to any external servers (except Google Gemini API for analysis)
- Clear your browser data to reset the application

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with JavaScript enabled

## 🔒 Privacy & Security

- Your API key is stored locally in your browser
- Images are processed client-side and sent directly to Google Gemini API
- No data is stored on external servers
- All processing happens in your browser

## 📱 Mobile Support

The application is fully responsive and works on:
- Smartphones
- Tablets
- Desktop computers

## 🛠️ Customization

You can easily customize the application by editing the HTML file:

- **Colors**: Modify the CSS variables in the `<style>` section
- **AI Behavior**: Update the system instruction in the chat function
- **Features**: Add or remove functionality by editing the JavaScript

## 🐛 Troubleshooting

### "Please configure your Gemini API key first"
- Make sure you've entered a valid Gemini API key
- Check that your API key has the necessary permissions

### "Failed to analyze image"
- Check your internet connection
- Verify your API key is correct
- Ensure the image file is under 4MB
- Try a different image format

### Chat not working
- Verify your API key is configured
- Check browser console for error messages
- Ensure you have an active internet connection

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Since this is a standalone HTML file, contributions can be made by:
1. Forking the repository
2. Making changes to the HTML file
3. Testing thoroughly
4. Submitting a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Create an issue in the repository
- Review the browser console for error messages

---

**Enjoy exploring marine life with AI! 🐠🦈🐙**