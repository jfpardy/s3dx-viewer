import React from 'react';
import { Shape3DDesign } from '../types/s3dx';

interface BoardInfoProps {
  design: Shape3DDesign;
}

export const BoardInfo: React.FC<BoardInfoProps> = ({ design }) => {
  const { board } = design;

  return (
    <div className="board-info">
      <h2>Board Information</h2>
      
      <div className="info-section">
        <h3>Basic Info</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Name:</label>
            <span>{board.name || 'Unnamed'}</span>
          </div>
          <div className="info-item">
            <label>Author:</label>
            <span>{board.author || 'Unknown'}</span>
          </div>
          <div className="info-item">
            <label>Category:</label>
            <span>{board.category || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Construction:</label>
            <span>{board.construction || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>Dimensions</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Length:</label>
            <span>{board.length.toFixed(1)} cm</span>
          </div>
          <div className="info-item">
            <label>Width:</label>
            <span>{board.width.toFixed(1)} cm</span>
          </div>
          <div className="info-item">
            <label>Thickness:</label>
            <span>{board.thickness.toFixed(1)} cm</span>
          </div>
          <div className="info-item">
            <label>Volume:</label>
            <span>{board.volume.toFixed(1)} L</span>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>Rocker</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Nose Rocker:</label>
            <span>{board.nose_rocker.toFixed(1)} cm</span>
          </div>
          <div className="info-item">
            <label>Tail Rocker:</label>
            <span>{board.tail_rocker.toFixed(1)} cm</span>
          </div>
        </div>
      </div>

      {board.rider_name && (
        <div className="info-section">
          <h3>Rider Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Rider Name:</label>
              <span>{board.rider_name}</span>
            </div>
            {board.rider_weight > 0 && (
              <div className="info-item">
                <label>Rider Weight:</label>
                <span>{board.rider_weight.toFixed(1)} kg</span>
              </div>
            )}
          </div>
        </div>
      )}

      {board.comment && (
        <div className="info-section">
          <h3>Comments</h3>
          <p className="comment">{board.comment}</p>
        </div>
      )}

      <style>{`
        .board-info {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .board-info h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 24px;
        }

        .info-section {
          margin-bottom: 24px;
        }

        .info-section h3 {
          margin: 0 0 12px 0;
          color: #555;
          font-size: 18px;
          border-bottom: 2px solid #eee;
          padding-bottom: 4px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .info-item span {
          color: #333;
          font-size: 16px;
        }

        .comment {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid #007bff;
          margin: 0;
          line-height: 1.5;
          color: #555;
        }
      `}</style>
    </div>
  );
};