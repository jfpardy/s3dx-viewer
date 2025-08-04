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
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 25px;
          border: 1px solid var(--border-color);
          margin-bottom: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.3s ease;
        }

        .board-info h2 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.8rem;
          font-weight: 600;
        }

        .info-section {
          margin-bottom: 24px;
        }

        .info-section:last-child {
          margin-bottom: 0;
        }

        .info-section h3 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 8px;
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
          padding: 8px 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .info-item label {
          font-weight: 500;
          color: var(--text-tertiary);
          font-size: 0.9rem;
        }

        .info-item span {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .comment {
          background: var(--bg-tertiary);
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid var(--link-color);
          margin: 0;
          line-height: 1.6;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};