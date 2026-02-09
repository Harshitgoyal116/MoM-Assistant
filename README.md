
# 📄 MOM Assistant Pro
### Enterprise-grade Minutes of Meeting (MOM) Generator

MOM Assistant Pro is a secure, browser-based tool that captures system audio (from Teams, Zoom, or Webex), respects your privacy with a custom Signal Gate (Mute-Sync), and uses Gemini AI to generate structured meeting minutes.

## 🚀 Quick Start (Hosting on GitHub)

To host this app for free and share it with others, follow these steps:

### 1. Create a GitHub Repository
1. Create a new repository on GitHub.
2. Push all files in this directory to the repository.

### 2. Configure Your API Key
For the app to work, it needs a Google Gemini API Key. Since you shouldn't hardcode this for security:
1. Go to your GitHub Repository **Settings** > **Secrets and variables** > **Actions**.
2. Add a **New repository secret**.
3. Name: `API_KEY`
4. Value: `YOUR_GEMINI_API_KEY_HERE`

### 3. Deploy to Vercel or Netlify (Recommended)
These platforms are the easiest for React apps:
1. Connect your GitHub account to [Vercel](https://vercel.com).
2. Import the `mom-assistant-pro` repository.
3. In the **Environment Variables** section, add:
   - Key: `API_KEY`
   - Value: `YOUR_GEMINI_API_KEY_HERE`
4. Click **Deploy**. Your app will be live at a custom URL.

### 4. Deploy to GitHub Pages (Alternative)
If you prefer GitHub Pages, you can use a GitHub Action to build the project and inject the secret:
1. Add a file at `.github/workflows/deploy.yml`.
2. Configure it to run `npm run build`.
3. Ensure the build process defines `process.env.API_KEY` using your secret.

## 🛡️ Privacy Features
- **Signal Gate**: Automatically detects your Teams/Zoom mute status and ignores "ghost audio" capture.
- **Manual Kill-Switch**: A dedicated button to physically disconnect the microphone from the recording stream.
- **System Audio Only**: Can capture meeting attendees without requiring your own microphone to be active.

## 🛠️ Tech Stack
- **AI**: Google Gemini (gemini-3-flash-preview)
- **Frontend**: React 19, Tailwind CSS
- **Audio**: Web Audio API (MediaRecorder, AnalyserNode, GainNode)
- **Deployment**: Vite (ESM)

---
*Developed for professional enterprise environments.*
