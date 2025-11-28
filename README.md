# Area Checker React App

A professional, clean React application to check service availability in a user's area.

## Features
- **Geolocation Support**: Automatically detects user location (if permitted).
- **Smart Search**: Debounced search with autocomplete suggestions.
- **Persistence**: Remembers the user's selected area using `localStorage`.
- **Secure**: Designed to work with environment variables.

## Quick Start

### 1. Setup Frontend
This code is designed to be dropped into a standard Create React App or Vite project.

1.  Create a new project (if you haven't already):
    ```bash
    npx create-react-app area-checker
    # OR
    npm create vite@latest area-checker -- --template react
    ```
2.  Replace `src/App.jsx` (or `src/App.js`) with the provided `App.jsx`.
3.  Replace `src/index.css` with the provided `index.css`.

### 2. Configure Environment
Create a `.env` file in the root of your project to store your API key safely.

**For Create React App:**
```env
REACT_APP_AREA_API_KEY=your_actual_api_key_here
```

**For Vite:**
Change `process.env.REACT_APP_AREA_API_KEY` in `App.jsx` to `import.meta.env.VITE_AREA_API_KEY` and use:
```env
VITE_AREA_API_KEY=your_actual_api_key_here
```

### 3. Run the App
```bash
npm start
# OR for Vite
npm run dev
```

## Backend Proxy (Recommended for Production)
To keep your API key truly secret, do not store it in the frontend code. Instead, use the provided `server.js` example.

1.  Install dependencies:
    ```bash
    npm install express cors node-fetch dotenv
    ```
2.  Create a `.env` file for the server:
    ```env
    AREA_API_KEY=your_server_side_secret
    PORT=3001
    ```
3.  Run the server:
    ```bash
    node server.js
    ```
4.  Update `App.jsx` to point to your local server:
    ```javascript
    const ENDPOINTS = {
      SUGGESTIONS: 'http://localhost:3001/api/suggestions',
      CHECK: 'http://localhost:3001/api/check',
      // ...
    };
    ```

## Project Structure
- `App.jsx`: Main application logic and UI.
- `index.css`: All styling for the component.
- `server.js`: Optional Node.js proxy server.
