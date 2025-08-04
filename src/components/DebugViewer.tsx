import React from 'react';
import { Shape3DDesign } from '../types/s3dx';
import { BezierEvaluator } from '../utils/bezierEvaluator';

interface DebugViewerProps {
  design: Shape3DDesign;
}

export const DebugViewer: React.FC<DebugViewerProps> = ({ design }) => {
  const bezierEvaluator = new BezierEvaluator();

  // Generate some test points to see what we're working with
  const outlinePoints = bezierEvaluator.generateBezierPoints(design.board.otl, 20);
  const bottomPoints = bezierEvaluator.generateBezierPoints(design.board.str_bot, 20);
  const deckPoints = design.board.str_deck.control_points.points.length > 0 
    ? bezierEvaluator.generateBezierPoints(design.board.str_deck, 20) 
    : [];

  console.log('=== DEBUG INFO ===');
  console.log('Board dimensions:', design.board.length, 'x', design.board.width, 'x', design.board.thickness);
  console.log('Outline control points:', design.board.otl.control_points.points.length);
  console.log('Outline tangent1 points:', design.board.otl.tangents_1.points.length);
  console.log('Outline tangent2 points:', design.board.otl.tangents_2.points.length);
  console.log('Bottom rocker control points:', design.board.str_bot.control_points.points.length);
  console.log('Deck rocker control points:', design.board.str_deck.control_points.points.length);
  console.log('Number of couples:', design.board.couples.length);
  console.log('Generated outline points:', outlinePoints.length);
  console.log('Generated bottom points:', bottomPoints.length);
  console.log('Generated deck points:', deckPoints.length);

  // Log first few points for inspection
  console.log('First 3 outline points:', outlinePoints.slice(0, 3));
  console.log('First 3 bottom points:', bottomPoints.slice(0, 3));
  if (deckPoints.length > 0) {
    console.log('First 3 deck points:', deckPoints.slice(0, 3));
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h3>Debug Information</h3>
      <div>
        <strong>Board Dimensions:</strong><br/>
        Length: {design.board.length.toFixed(2)}cm<br/>
        Width: {design.board.width.toFixed(2)}cm<br/>
        Thickness: {design.board.thickness.toFixed(2)}cm<br/>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Bezier Curves:</strong><br/>
        Outline control points: {design.board.otl.control_points.points.length}<br/>
        Outline tangent1 points: {design.board.otl.tangents_1.points.length}<br/>
        Outline tangent2 points: {design.board.otl.tangents_2.points.length}<br/>
        Bottom rocker control points: {design.board.str_bot.control_points.points.length}<br/>
        Deck rocker control points: {design.board.str_deck.control_points.points.length}<br/>
        Number of couples: {design.board.couples.length}<br/>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Generated Points:</strong><br/>
        Outline points: {outlinePoints.length}<br/>
        Bottom points: {bottomPoints.length}<br/>
        Deck points: {deckPoints.length}<br/>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Sample Outline Points:</strong><br/>
        {outlinePoints.slice(0, 5).map((pt, i) => (
          <div key={i}>
            Point {i}: x={pt.x.toFixed(2)}, y={pt.y.toFixed(2)}, z={pt.z.toFixed(2)}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Sample Bottom Points:</strong><br/>
        {bottomPoints.slice(0, 5).map((pt, i) => (
          <div key={i}>
            Point {i}: x={pt.x.toFixed(2)}, y={pt.y.toFixed(2)}, z={pt.z.toFixed(2)}
          </div>
        ))}
      </div>

      {deckPoints.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Sample Deck Points:</strong><br/>
          {deckPoints.slice(0, 5).map((pt, i) => (
            <div key={i}>
              Point {i}: x={pt.x.toFixed(2)}, y={pt.y.toFixed(2)}, z={pt.z.toFixed(2)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};