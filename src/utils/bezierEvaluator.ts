import { Point3D, Bezier3D } from '../types/s3dx';

/**
 * Professional Bezier curve evaluator implementing BoardCAD-compatible algorithms.
 * 
 * This class provides accurate mathematical evaluation of Bezier curves used in
 * surfboard design, supporting various curve types and proper tangent handling.
 * 
 * Supported curve types:
 * - Cubic Bezier curves with control points and tangent vectors
 * - Quadratic Bezier curves (3 control points)
 * - Linear interpolation (2 control points)
 * - Multi-segment curves (4+ control points)
 * 
 * @example
 * ```typescript
 * const evaluator = new BezierEvaluator();
 * const curvePoints = evaluator.generateBezierPoints(bezierCurve, 50);
 * const zValue = evaluator.interpolateZAtX(curvePoints, 150.0);
 * ```
 */
export class BezierEvaluator {
  
  /**
   * Evaluate cubic Bezier curve at parameter t (0 to 1)
   */
  private evaluateCubicBezier(p0: Point3D, p1: Point3D, p2: Point3D, p3: Point3D, t: number): Point3D {
    const invT = 1.0 - t;
    const t2 = t * t;
    const t3 = t2 * t;
    const invT2 = invT * invT;
    const invT3 = invT2 * invT;
    
    return {
      x: invT3 * p0.x + 3 * invT2 * t * p1.x + 3 * invT * t2 * p2.x + t3 * p3.x,
      y: invT3 * p0.y + 3 * invT2 * t * p1.y + 3 * invT * t2 * p2.y + t3 * p3.y,
      z: invT3 * p0.z + 3 * invT2 * t * p1.z + 3 * invT * t2 * p2.z + t3 * p3.z,
      u: invT3 * p0.u + 3 * invT2 * t * p1.u + 3 * invT * t2 * p2.u + t3 * p3.u,
      color: p0.color
    };
  }

  /**
   * Evaluate quadratic Bezier curve at parameter t (0 to 1)
   */
  private evaluateQuadraticBezier(p0: Point3D, p1: Point3D, p2: Point3D, t: number): Point3D {
    const invT = 1.0 - t;
    const invT2 = invT * invT;
    const t2 = t * t;
    const twoInvTt = 2.0 * invT * t;
    
    return {
      x: invT2 * p0.x + twoInvTt * p1.x + t2 * p2.x,
      y: invT2 * p0.y + twoInvTt * p1.y + t2 * p2.y,
      z: invT2 * p0.z + twoInvTt * p1.z + t2 * p2.z,
      u: invT2 * p0.u + twoInvTt * p1.u + t2 * p2.u,
      color: p0.color
    };
  }

  /**
   * Linear interpolation between two points
   */
  private evaluateLinear(p0: Point3D, p1: Point3D, t: number): Point3D {
    return {
      x: p0.x + t * (p1.x - p0.x),
      y: p0.y + t * (p1.y - p0.y),
      z: p0.z + t * (p1.z - p0.z),
      u: p0.u + t * (p1.u - p0.u),
      color: p0.color
    };
  }

  /**
   * Generate smooth points along a Bezier curve using control points and tangent vectors
   * This follows the trident implementation exactly
   */
  public generateBezierPoints(bezier: Bezier3D, numPoints: number = 50): Point3D[] {
    // Ensure we have at least 2 points to create a curve
    if (bezier.control_points.points.length < 2) {
      return [];
    }

    const cp = bezier.control_points.points;
    const t1 = bezier.tangents_1.points.length > 0 ? bezier.tangents_1.points : [];
    const t2 = bezier.tangents_2.points.length > 0 ? bezier.tangents_2.points : [];

    const points: Point3D[] = new Array(numPoints);

    // Case 1: Handle curves with control points and tangent data (cubic Bezier)
    if (cp.length >= 2 && t1.length >= cp.length && t2.length >= cp.length) {
      const numControlSegments = cp.length - 1;
      const pointsPerSegment = Math.floor(numPoints / numControlSegments);
      let pointIdx = 0;

      for (let seg = 0; seg < numControlSegments; seg++) {
        let segmentPoints = pointsPerSegment;
        if (seg === numControlSegments - 1) {
          // Last segment gets any remaining points
          segmentPoints = numPoints - pointIdx;
        }

        const p0 = cp[seg];
        const p3 = cp[seg + 1];
        const p1 = t2[seg];  // Tangent out from p0
        const p2 = t1[seg + 1];  // Tangent in to p3

        for (let j = 0; j < segmentPoints; j++) {
          if (pointIdx >= numPoints) break;

          const localT = segmentPoints > 1 ? j / (segmentPoints - 1) : 0.0;
          points[pointIdx] = this.evaluateCubicBezier(p0, p1, p2, p3, localT);
          pointIdx++;
        }
      }

      return points;
    }

    // Case 2: Three control points (quadratic Bezier)
    if (cp.length === 3) {
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        points[i] = this.evaluateQuadraticBezier(cp[0], cp[1], cp[2], t);
      }
      return points;
    }

    // Case 3: Two control points (linear interpolation)
    if (cp.length === 2) {
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        points[i] = this.evaluateLinear(cp[0], cp[1], t);
      }
      return points;
    }

    // Case 4: More than 3 control points - create segments between adjacent points
    if (cp.length > 3) {
      const totalSegments = cp.length - 1;
      const pointsPerSegment = Math.floor(numPoints / totalSegments);
      let pointIdx = 0;

      for (let seg = 0; seg < totalSegments; seg++) {
        let segmentPoints = pointsPerSegment;
        if (seg === totalSegments - 1) {
          segmentPoints = numPoints - pointIdx;
        }

        const p0 = cp[seg];
        const p1 = cp[seg + 1];

        for (let j = 0; j < segmentPoints; j++) {
          if (pointIdx >= numPoints) break;

          const t = segmentPoints > 1 ? j / (segmentPoints - 1) : 0.0;
          points[pointIdx] = this.evaluateLinear(p0, p1, t);
          pointIdx++;
        }
      }

      return points;
    }

    return [];
  }

  /**
   * Mirror cross-section points to create full profile from half profile
   */
  public mirrorCrossSectionPoints(halfPoints: Point3D[]): Point3D[] {
    if (halfPoints.length === 0) return [];

    // Check if already mirrored (has negative Y values)
    const hasNegative = halfPoints.some(pt => pt.y < -0.001);
    
    if (hasNegative) {
      // Already full profile, just copy
      return [...halfPoints];
    }

    // Create mirrored profile
    // Skip first point if it's on centerline (Y ≈ 0)
    let startIdx = 0;
    if (Math.abs(halfPoints[0].y) < 0.001) {
      startIdx = 1;
    }

    const numToMirror = halfPoints.length - startIdx;
    const result: Point3D[] = [...halfPoints];

    // Add mirrored half
    for (let i = 0; i < numToMirror; i++) {
      const srcIdx = halfPoints.length - 1 - i;
      const mirroredPoint = { ...halfPoints[srcIdx] };
      mirroredPoint.y = -mirroredPoint.y;
      result.push(mirroredPoint);
    }

    return result;
  }

  /**
   * Interpolate Z value at given X from curve points
   */
  public interpolateZAtX(points: Point3D[], x: number): number {
    if (points.length === 0) return 0.0;

    // Find surrounding points
    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x <= points[i + 1].x) {
        const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
        return points[i].z * (1.0 - t) + points[i + 1].z * t;
      }
    }

    // Outside range
    if (x < points[0].x) {
      return points[0].z;
    }
    return points[points.length - 1].z;
  }
}