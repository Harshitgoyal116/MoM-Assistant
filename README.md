# 📄 MOM Assistant Pro
### Enterprise-grade Minutes of Meeting (MOM) Generator

MOM Assistant Pro is a secure, browser-based tool that captures system audio (from Teams, Zoom, or Webex), respects your privacy with a custom Signal Gate (Mute-Sync), and uses Gemini AI to generate structured meeting minutes.

## 🚀 Quick Start (Hosting on GitHub)

To host this app for free and share it with others, follow these steps:

### 1. Create a GitHub Repository
1. Create a new repository on GitHub.
2. Push all files in this directory to the repository.

### 2. Configure Your API Key
For the app to work, it needs a Google Gemini API Key.  
**Do NOT hardcode the key in the source code.**

1. Go to your GitHub Repository  
   **Settings → Secrets and variables → Actions**
2. Add a **New repository secret**
3. Name: `API_KEY`
4. Value: `YOUR_GEMINI_API_KEY_HERE`

> During build, this secret is injected as `VITE_API_KEY` for the Vite app.

---

### 3. Deploy to Vercel or Netlify (Recommended)
These platforms are the easiest for React + Vite apps:

1. Connect your GitHub account to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Import the `mom-assistant-pro` repository.
3. In the **Environment Variables** section, add:
   - Key: `VITE_API_KEY`
   - Value: `YOUR_GEMINI_API_KEY_HERE`
4. Deploy the project.

Your app will be live at a public URL.

---

### 4. Deploy to GitHub Pages (Alternative)

GitHub Pages requires a build step via GitHub Actions.

1. Add a workflow at `.github/workflows/deploy.yml`
2. The workflow should:
   - Run `npm install`
   - Run `npm run build`
   - Inject the secret as `VITE_API_KEY`
   - Deploy the `dist/` folder

> Important: GitHub Pages hosts **static files only**.  
> All React and TypeScript code must be compiled by Vite.

---

## 🛡️ Privacy Features
- **Signal Gate**: Automatically detects Teams/Zoom mute status and ignores ghost audio.
- **Manual Kill-Switch**: A dedicated control to disconnect the microphone stream.
- **System Audio Only**: Capture meeting audio without activating your own microphone.

---

## 🛠️ Tech Stack
- **AI**: Google Gemini (`gemini-3-flash-preview`)
- **Frontend**: React 18, Tailwind CSS
- **Audio**: Web Audio API (MediaRecorder, AnalyserNode, GainNode)
- **Build & Deployment**: Vite (ESM), GitHub Pages / Vercel / Netlify

---

⚠️ **Security Note**  
This application runs Gemini directly in the browser.  
For enterprise-grade deployments, restrict your API key to your domain or move Gemini calls to a backend proxy.

---
*Developed for professional enterprise environments.*
