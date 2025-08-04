import { useState, useEffect } from 'react';
import { Shape3DDesign } from './types/s3dx';
import { FileUpload } from './components/FileUpload';
import { ThreeViewer } from './components/ThreeViewer';
import { BoardInfo } from './components/BoardInfo';
import { DebugViewer } from './components/DebugViewer';
import { S3DXParser } from './utils/s3dxParser';
import './App.css';

function App() {
  const [design, setDesign] = useState<Shape3DDesign | null>(null);
  const [error, setError] = useState<string>('');

  // Auto-load the sample file for testing
  useEffect(() => {
    const loadSampleFile = async () => {
      try {
        const response = await fetch('/surfboard.s3dx');
        const text = await response.text();
        const parser = new S3DXParser();
        const parsedDesign = parser.parseS3DX(text);
        if (parsedDesign) {
          setDesign(parsedDesign);
          console.log('Auto-loaded sample file');
        }
      } catch (error) {
        console.log('Could not auto-load sample file:', error);
      }
    };
    
    loadSampleFile();
  }, []);

  const handleFileLoaded = (loadedDesign: Shape3DDesign) => {
    setDesign(loadedDesign);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setDesign(null);
  };

  const handleReset = () => {
    setDesign(null);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <a href="https://jfpardy.com" className="home-button" title="Back to jfpardy.com">
            🏠
          </a>
          <div className="header-text">
            <h1>S3DX Viewer</h1>
            <p>Upload and view S3DX surfboard design files in 3D</p>
          </div>
        </div>
      </header>

      <main className="App-main">
        {!design && (
          <div className="upload-section">
            <FileUpload onFileLoaded={handleFileLoaded} onError={handleError} />
            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
              </div>
            )}
          </div>
        )}

        {design && (
          <div className="viewer-section">
            <div className="controls">
              <button onClick={handleReset} className="reset-button">
                📁 Load New File
              </button>
              <div className="help-text">
                🖱️ Left click + drag to rotate • 🖱️ Right click + drag to pan • Scroll to zoom
              </div>
            </div>

            <div className="content-grid">
              <div className="viewer-container">
                <ThreeViewer design={design} className="three-viewer" />
              </div>
              
              <div className="info-container">
                <BoardInfo design={design} />
                <DebugViewer design={design} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Built with React, TypeScript, and Three.js</p>
      </footer>
    </div>
  );
}

export default App;