import * as THREE from 'three';
import { Shape3DDesign } from '../types/s3dx';
import { BezierEvaluator } from './bezierEvaluator';

/**
 * Generate wireframe visualization of surfboard curves
 */
export class WireframeGenerator {
  private bezierEvaluator: BezierEvaluator;

  constructor() {
    this.bezierEvaluator = new BezierEvaluator();
  }

  public generateWireframe(design: Shape3DDesign): THREE.Group {
    const group = new THREE.Group();

    // Generate outline curve
    const outlinePoints = this.bezierEvaluator.generateBezierPoints(design.board.otl, 50);
    console.log('Wireframe: outline points:', outlinePoints.length);
    if (outlinePoints.length > 0) {
      console.log('First outline point:', outlinePoints[0]);
      console.log('Last outline point:', outlinePoints[outlinePoints.length - 1]);
      
      const outlineGeometry = this.createLineGeometry(outlinePoints);
      const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
      const outlineLine = new THREE.Line(outlineGeometry, outlineMaterial);
      group.add(outlineLine);

      // Mirror the outline for the other side
      const mirroredOutlineGeometry = this.createLineGeometry(outlinePoints, true);
      const mirroredOutlineLine = new THREE.Line(mirroredOutlineGeometry, outlineMaterial);
      group.add(mirroredOutlineLine);
    }

    // Generate bottom rocker curve
    const bottomPoints = this.bezierEvaluator.generateBezierPoints(design.board.str_bot, 50);
    console.log('Wireframe: bottom points:', bottomPoints.length);
    if (bottomPoints.length > 0) {
      console.log('First bottom point:', bottomPoints[0]);
      const bottomGeometry = this.createLineGeometry(bottomPoints);
      const bottomMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
      const bottomLine = new THREE.Line(bottomGeometry, bottomMaterial);
      group.add(bottomLine);
    }

    // Generate deck rocker curve
    if (design.board.str_deck.control_points.points.length > 0) {
      const deckPoints = this.bezierEvaluator.generateBezierPoints(design.board.str_deck, 50);
      if (deckPoints.length > 0) {
        const deckGeometry = this.createLineGeometry(deckPoints);
        const deckMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
        const deckLine = new THREE.Line(deckGeometry, deckMaterial);
        group.add(deckLine);
      }
    }

    // Add some cross-sections to show the shape
    this.addCrossSections(group, design);

    return group;
  }

  private createLineGeometry(points: any[], mirror: boolean = false): THREE.BufferGeometry {
    const vertices: number[] = [];
    
    for (const point of points) {
      vertices.push(point.x, mirror ? -point.y : point.y, point.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }

  private addCrossSections(group: THREE.Group, design: Shape3DDesign): void {
    const outlinePoints = this.bezierEvaluator.generateBezierPoints(design.board.otl, 50);
    const bottomPoints = this.bezierEvaluator.generateBezierPoints(design.board.str_bot, 50);
    const deckPoints = design.board.str_deck.control_points.points.length > 0 
      ? this.bezierEvaluator.generateBezierPoints(design.board.str_deck, 50)
      : [];

    if (outlinePoints.length === 0) return;

    // Find X range
    const minX = Math.min(...outlinePoints.map(p => p.x));
    const maxX = Math.max(...outlinePoints.map(p => p.x));

    // Add cross-sections at regular intervals
    const numSections = 5;
    for (let i = 0; i <= numSections; i++) {
      const u = i / numSections;
      const x = minX + u * (maxX - minX);

      // Get width at this position
      const width = this.getWidthAtX(outlinePoints, x);
      if (width <= 0) continue;

      // Get heights
      const bottomZ = this.getZAtX(bottomPoints, x);
      const deckZ = deckPoints.length > 0 ? this.getZAtX(deckPoints, x) : bottomZ + design.board.thickness * 0.01;

      // Create simple elliptical cross-section
      const crossSectionVertices: number[] = [];
      const segments = 20;
      
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * 2 * Math.PI;
        const y = (width * 0.5) * Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const t = (cosAngle + 1) * 0.5;
        const z = bottomZ * (1 - t) + deckZ * t;
        
        crossSectionVertices.push(x, y, z);
      }

      const crossGeometry = new THREE.BufferGeometry();
      crossGeometry.setAttribute('position', new THREE.Float32BufferAttribute(crossSectionVertices, 3));
      
      const crossMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffff00, 
        opacity: 0.5, 
        transparent: true 
      });
      
      const crossLine = new THREE.LineLoop(crossGeometry, crossMaterial);
      group.add(crossLine);
    }
  }

  private getWidthAtX(outlinePoints: any[], x: number): number {
    let maxY = 0;
    let found = false;

    // Try exact matches first
    for (const pt of outlinePoints) {
      if (Math.abs(pt.x - x) < 1.0) {
        maxY = Math.max(maxY, Math.abs(pt.y));
        found = true;
      }
    }

    if (!found) {
      // Interpolate
      for (let i = 0; i < outlinePoints.length - 1; i++) {
        if (x >= outlinePoints[i].x && x <= outlinePoints[i + 1].x) {
          const t = (x - outlinePoints[i].x) / (outlinePoints[i + 1].x - outlinePoints[i].x);
          const y1 = Math.abs(outlinePoints[i].y);
          const y2 = Math.abs(outlinePoints[i + 1].y);
          maxY = y1 * (1 - t) + y2 * t;
          found = true;
          break;
        }
      }
    }

    return found ? maxY * 2 : 0;
  }

  private getZAtX(points: any[], x: number): number {
    if (points.length === 0) return 0;

    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x <= points[i + 1].x) {
        const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
        return points[i].z * (1 - t) + points[i + 1].z * t;
      }
    }

    if (x < points[0].x) return points[0].z;
    return points[points.length - 1].z;
  }
}