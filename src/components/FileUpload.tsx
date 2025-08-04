import React, { useRef, useState } from 'react';
import { Shape3DDesign } from '../types/s3dx';
import { S3DXParser } from '../utils/s3dxParser';

interface FileUploadProps {
  onFileLoaded: (design: Shape3DDesign) => void;
  onError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileRead = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.s3dx')) {
      onError('Please select a valid S3DX file');
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const parser = new S3DXParser();
      const design = parser.parseS3DX(text);

      if (design) {
        onFileLoaded(design);
      } else {
        onError('Failed to parse S3DX file. Please check the file format.');
      }
    } catch (error) {
      onError(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".s3dx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading S3DX file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h3>Drop S3DX file here or click to browse</h3>
            <p>Supported format: .s3dx</p>
          </div>
        )}
      </div>

      <style>{`
        .file-upload-container {
          width: 100%;
          height: 200px;
          margin-bottom: 20px;
        }

        .file-upload-area {
          width: 100%;
          height: 100%;
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: var(--bg-secondary);
        }

        .file-upload-area:hover {
          border-color: var(--link-color);
          background-color: var(--bg-tertiary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadow-light);
        }

        .file-upload-area.dragging {
          border-color: var(--link-color);
          background-color: var(--bg-tertiary);
          border-width: 2px;
        }

        .file-upload-area.loading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-content {
          text-align: center;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .upload-content h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
        }

        .upload-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .loading-content {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--bg-tertiary);
          border-top: 4px solid var(--link-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-content p {
          margin: 0;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};