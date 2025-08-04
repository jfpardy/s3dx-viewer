import { 
  Shape3DDesign, 
  Board, 
  Scene, 
  Point3D, 
  Polygon3D, 
  Bezier3D, 
  Couple,
  Lighting,
  Camera,
  View
} from '../types/s3dx';

export class S3DXParser {
  private parseFloat(s: string): number {
    const val = parseFloat(s);
    return isNaN(val) ? 0.0 : val;
  }

  private parseInt(s: string): number {
    const val = parseInt(s, 10);
    return isNaN(val) ? 0 : val;
  }

  private getElementText(element: Element): string {
    return element.textContent?.trim() || '';
  }

  private getChildText(parent: Element, tagName: string): string {
    const child = parent.querySelector(tagName);
    return child ? this.getElementText(child) : '';
  }

  private parsePoint3D(element: Element): Point3D {
    return {
      x: this.parseFloat(this.getChildText(element, 'x')),
      y: this.parseFloat(this.getChildText(element, 'y')),
      z: this.parseFloat(this.getChildText(element, 'z')),
      u: this.parseFloat(this.getChildText(element, 'u')),
      color: this.parseInt(this.getChildText(element, 'color'))
    };
  }

  private parsePolygon3D(element: Element): Polygon3D {
    const points: Point3D[] = [];
    let symmetryCenter: Point3D = { x: 0, y: 0, z: 0, u: 0, color: 0 };

    // Parse symmetry center
    const symmetryCenterEl = element.querySelector('Symmetry_center Point3d');
    if (symmetryCenterEl) {
      symmetryCenter = this.parsePoint3D(symmetryCenterEl);
    }

    // Parse points
    const pointElements = element.querySelectorAll('Point3d');
    pointElements.forEach(pointEl => {
      // Skip if this is the symmetry center point
      if (!pointEl.closest('Symmetry_center')) {
        points.push(this.parsePoint3D(pointEl));
      }
    });

    return {
      nb_of_points: this.parseInt(this.getChildText(element, 'Nb_of_points')),
      open: this.parseInt(this.getChildText(element, 'Open')),
      symmetry: this.parseInt(this.getChildText(element, 'Symmetry')),
      symmetry_center: symmetryCenter,
      plan: this.parseInt(this.getChildText(element, 'Plan')),
      points
    };
  }

  private parseBezier3D(element: Element): Bezier3D {
    const controlTypePoints: number[] = [];
    const tangentTypePoints: number[] = [];

    // Parse control type points
    let i = 0;
    while (true) {
      const ctpEl = element.querySelector(`Control_type_point_${i}`);
      if (!ctpEl) break;
      controlTypePoints.push(this.parseInt(this.getElementText(ctpEl)));
      i++;
    }

    // Parse tangent type points
    i = 0;
    while (true) {
      const ttpEl = element.querySelector(`Tangent_type_point_${i}`);
      if (!ttpEl) break;
      tangentTypePoints.push(this.parseInt(this.getElementText(ttpEl)));
      i++;
    }

    const emptyPolygon: Polygon3D = {
      nb_of_points: 0,
      open: 0,
      symmetry: 0,
      symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
      plan: 0,
      points: []
    };

    return {
      name: this.getChildText(element, 'Name'),
      degree: this.parseInt(this.getChildText(element, 'Degree')),
      open: this.parseInt(this.getChildText(element, 'Open')),
      symmetry: this.parseInt(this.getChildText(element, 'Symmetry')),
      plan: this.parseInt(this.getChildText(element, 'Plan')),
      control_points: element.querySelector('Control_points Polygone3d') 
        ? this.parsePolygon3D(element.querySelector('Control_points Polygone3d')!)
        : emptyPolygon,
      tangents_1: element.querySelector('Tangents_1 Polygone3d')
        ? this.parsePolygon3D(element.querySelector('Tangents_1 Polygone3d')!)
        : emptyPolygon,
      tangents_2: element.querySelector('Tangents_2 Polygone3d')
        ? this.parsePolygon3D(element.querySelector('Tangents_2 Polygone3d')!)
        : emptyPolygon,
      tangents_m: element.querySelector('Tangents_m Polygone3d')
        ? this.parsePolygon3D(element.querySelector('Tangents_m Polygone3d')!)
        : emptyPolygon,
      control_type_points: controlTypePoints,
      tangent_type_points: tangentTypePoints
    };
  }

  private parseCouple(element: Element): Couple {
    const bezierEl = element.querySelector('Bezier3d');
    const emptyBezier: Bezier3D = {
      name: '',
      degree: 0,
      open: 0,
      symmetry: 0,
      plan: 0,
      control_points: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      tangents_1: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      tangents_2: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      tangents_m: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      control_type_points: [],
      tangent_type_points: []
    };

    return {
      dessus: this.parseInt(this.getChildText(element, 'Dessus')),
      dessous: this.parseInt(this.getChildText(element, 'Dessous')),
      displayed: this.parseInt(this.getChildText(element, 'Displayed')),
      bezier: bezierEl ? this.parseBezier3D(bezierEl) : emptyBezier
    };
  }

  private parseView(element: Element): View {
    return {
      version: this.parseFloat(this.getChildText(element, 'Version')),
      wh: this.parseFloat(this.getChildText(element, 'Wh')),
      ww: this.parseFloat(this.getChildText(element, 'Ww')),
      wox: this.parseFloat(this.getChildText(element, 'Wox')),
      woy: this.parseFloat(this.getChildText(element, 'Woy')),
      uh: this.parseFloat(this.getChildText(element, 'Uh')),
      uw: this.parseFloat(this.getChildText(element, 'Uw')),
      uxmin: this.parseFloat(this.getChildText(element, 'Uxmin')),
      uymin: this.parseFloat(this.getChildText(element, 'Uymin')),
      cxy: this.parseFloat(this.getChildText(element, 'Cxy')),
      mrgx: this.parseFloat(this.getChildText(element, 'Mrgx')),
      mrgy: this.parseFloat(this.getChildText(element, 'Mrgy')),
      police: this.getChildText(element, 'Police'),
      over_sample: this.parseInt(this.getChildText(element, 'OverSample')),
      grid: this.parseFloat(this.getChildText(element, 'Grid'))
    };
  }

  private parseCamera(element: Element): Camera {
    const defaultPoint: Point3D = { x: 0, y: 0, z: 0, u: -1, color: 0 };
    const defaultView: View = {
      version: 1.2,
      wh: 865.0,
      ww: 1896.0,
      wox: 0,
      woy: 0,
      uh: 0,
      uw: 0,
      uxmin: 0,
      uymin: 0,
      cxy: 0,
      mrgx: 0,
      mrgy: 0,
      police: "MS Sans Serif",
      over_sample: 1,
      grid: 10.0
    };

    return {
      version: this.parseFloat(this.getChildText(element, 'Version')),
      alpha: this.parseFloat(this.getChildText(element, 'Alpha')),
      dim_obj: this.parseFloat(this.getChildText(element, 'DimObj')),
      crot: element.querySelector('Crot Point3d') 
        ? this.parsePoint3D(element.querySelector('Crot Point3d')!)
        : defaultPoint,
      cvis: element.querySelector('Cvis Point3d')
        ? this.parsePoint3D(element.querySelector('Cvis Point3d')!)
        : defaultPoint,
      ccam: element.querySelector('Ccam Point3d')
        ? this.parsePoint3D(element.querySelector('Ccam Point3d')!)
        : { x: 0, y: 0, z: -361.95, u: -1, color: 0 },
      oy: element.querySelector('Oy Point3d')
        ? this.parsePoint3D(element.querySelector('Oy Point3d')!)
        : { x: 0, y: 1, z: 0, u: -1, color: 0 },
      ur: element.querySelector('Ur Point3d')
        ? this.parsePoint3D(element.querySelector('Ur Point3d')!)
        : { x: 0, y: 0, z: 1, u: -1, color: 0 },
      view: element.querySelector('View')
        ? this.parseView(element.querySelector('View')!)
        : defaultView
    };
  }

  private parseLighting(element: Element): Lighting {
    return {
      version: this.parseFloat(this.getChildText(element, 'Version')),
      color: this.parseInt(this.getChildText(element, 'Color')),
      color_spot: this.parseInt(this.getChildText(element, 'ColorSpot')),
      intensity: this.parseFloat(this.getChildText(element, 'Intensity')),
      intensity2: this.parseFloat(this.getChildText(element, 'Intensity2')),
      intensity_ambient: this.parseFloat(this.getChildText(element, 'IntensityAmbient')),
      intensity_spec: this.parseFloat(this.getChildText(element, 'IntensitySpec')),
      ecl: element.querySelector('Ecl Point3d')
        ? this.parsePoint3D(element.querySelector('Ecl Point3d')!)
        : { x: 0, y: -2082.87, z: -2082.87, u: -1, color: 0 }
    };
  }

  private parseScene(element: Element): Scene {
    const defaultLighting: Lighting = {
      version: 9.0,
      ecl: { x: 0, y: -2082.87, z: -2082.87, u: -1, color: 0 },
      color: 16777215,
      color_spot: 16777215,
      intensity: 0.8,
      intensity2: 0.625,
      intensity_ambient: 0.475,
      intensity_spec: 1.0
    };

    const defaultCamera: Camera = {
      version: 1.2,
      alpha: 0,
      dim_obj: 208.287,
      crot: { x: 0, y: 0, z: 0, u: -1, color: 0 },
      cvis: { x: 0, y: 0, z: 0, u: -1, color: 0 },
      ccam: { x: 0, y: 0, z: -361.95, u: -1, color: 0 },
      oy: { x: 0, y: 1, z: 0, u: -1, color: 0 },
      ur: { x: 0, y: 0, z: 1, u: -1, color: 0 },
      view: {
        version: 1.2,
        wh: 865.0,
        ww: 1896.0,
        wox: 0,
        woy: 0,
        uh: 0,
        uw: 0,
        uxmin: 0,
        uymin: 0,
        cxy: 0,
        mrgx: 0,
        mrgy: 0,
        police: "MS Sans Serif",
        over_sample: 1,
        grid: 10.0
      }
    };

    return {
      version: this.parseFloat(this.getChildText(element, 'Version')),
      background_color: this.parseInt(this.getChildText(element, 'Background_color')),
      reflexion_map: this.getChildText(element, 'ReflexionMap'),
      display_sky_box: this.parseInt(this.getChildText(element, 'DisplaySkyBox')),
      lighting: element.querySelector('Lighting')
        ? this.parseLighting(element.querySelector('Lighting')!)
        : defaultLighting,
      camera: element.querySelector('Camera')
        ? this.parseCamera(element.querySelector('Camera')!)
        : defaultCamera
    };
  }

  private parseBoard(element: Element): Board {
    const couples: Couple[] = [];
    
    // Parse couples (cross-sections) - look for elements starting with "Couples_"
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName.startsWith('Couples_')) {
        couples.push(this.parseCouple(child));
      }
    }

    const emptyBezier: Bezier3D = {
      name: '',
      degree: 0,
      open: 0,
      symmetry: 0,
      plan: 0,
      control_points: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      tangents_1: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      tangents_2: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      tangents_m: {
        nb_of_points: 0,
        open: 0,
        symmetry: 0,
        symmetry_center: { x: 0, y: 0, z: 0, u: 0, color: 0 },
        plan: 0,
        points: []
      },
      control_type_points: [],
      tangent_type_points: []
    };

    return {
      version: this.parseInt(this.getChildText(element, 'Version')),
      version_number: this.getChildText(element, 'VersionNumber'),
      name: this.getChildText(element, 'Name'),
      author: this.getChildText(element, 'Author'),
      comment: this.getChildText(element, 'Comment'),
      variation: this.getChildText(element, 'Variation'),
      category: this.getChildText(element, 'Category'),
      category_type: this.getChildText(element, 'CategoryType'),
      construction: this.getChildText(element, 'Construction'),
      rider_name: this.getChildText(element, 'RiderName'),
      rider_weight: this.parseFloat(this.getChildText(element, 'RiderWeight')),

      // Dimensions
      length: this.parseFloat(this.getChildText(element, 'Length')),
      length_dev: this.parseFloat(this.getChildText(element, 'LengthDev')),
      width: this.parseFloat(this.getChildText(element, 'Width')),
      thickness: this.parseFloat(this.getChildText(element, 'Thickness')),
      tail_rocker: this.parseFloat(this.getChildText(element, 'Tail_rocker')),
      nose_rocker: this.parseFloat(this.getChildText(element, 'Nose_rocker')),
      volume: this.parseFloat(this.getChildText(element, 'Volume')) / 100.0, // Convert from centiliters
      surface_proj: this.parseFloat(this.getChildText(element, 'SurfaceProj')),

      // Additional measurements
      volume_tail: this.parseFloat(this.getChildText(element, 'VolumeTail')) / 100.0,
      volume_nose: this.parseFloat(this.getChildText(element, 'VolumeNose')) / 100.0,
      surface_proj_tail: this.parseFloat(this.getChildText(element, 'SurfaceProjTail')),
      surface_proj_nose: this.parseFloat(this.getChildText(element, 'SurfaceProjNose')),

      // Main curves
      otl: element.querySelector('Otl Bezier3d')
        ? this.parseBezier3D(element.querySelector('Otl Bezier3d')!)
        : emptyBezier,
      str_bot: element.querySelector('StrBot Bezier3d')
        ? this.parseBezier3D(element.querySelector('StrBot Bezier3d')!)
        : emptyBezier,
      str_deck: element.querySelector('StrDeck Bezier3d')
        ? this.parseBezier3D(element.querySelector('StrDeck Bezier3d')!)
        : emptyBezier,

      // Cross-sections
      number_of_slices: this.parseInt(this.getChildText(element, 'Number_of_slices')),
      couples,

      // Display properties
      color: this.parseInt(this.getChildText(element, 'Color')),
      color_bot: this.parseInt(this.getChildText(element, 'ColorBot')),
      color_rail: this.parseInt(this.getChildText(element, 'ColorRail'))
    };
  }

  public parseS3DX(xmlContent: string): Shape3DDesign | null {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      const rootElement = doc.querySelector('Shape3d_design');
      if (!rootElement) {
        throw new Error('No Shape3d_design element found');
      }

      const boardElement = rootElement.querySelector('Board');
      const sceneElement = rootElement.querySelector('Scene');

      if (!boardElement) {
        throw new Error('No Board element found');
      }

      const board = this.parseBoard(boardElement);
      const scene = sceneElement ? this.parseScene(sceneElement) : {
        version: 1.0,
        background_color: 0,
        reflexion_map: '',
        display_sky_box: 0,
        lighting: {
          version: 9.0,
          ecl: { x: 0, y: -2082.87, z: -2082.87, u: -1, color: 0 },
          color: 16777215,
          color_spot: 16777215,
          intensity: 0.8,
          intensity2: 0.625,
          intensity_ambient: 0.475,
          intensity_spec: 1.0
        },
        camera: {
          version: 1.2,
          alpha: 0,
          dim_obj: 208.287,
          crot: { x: 0, y: 0, z: 0, u: -1, color: 0 },
          cvis: { x: 0, y: 0, z: 0, u: -1, color: 0 },
          ccam: { x: 0, y: 0, z: -361.95, u: -1, color: 0 },
          oy: { x: 0, y: 1, z: 0, u: -1, color: 0 },
          ur: { x: 0, y: 0, z: 1, u: -1, color: 0 },
          view: {
            version: 1.2,
            wh: 865.0,
            ww: 1896.0,
            wox: 0,
            woy: 0,
            uh: 0,
            uw: 0,
            uxmin: 0,
            uymin: 0,
            cxy: 0,
            mrgx: 0,
            mrgy: 0,
            police: "MS Sans Serif",
            over_sample: 1,
            grid: 10.0
          }
        }
      };

      return { board, scene };
    } catch (error) {
      console.error('Error parsing S3DX file:', error);
      return null;
    }
  }
}