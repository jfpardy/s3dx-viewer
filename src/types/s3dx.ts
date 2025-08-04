export interface Point3D {
  x: number;
  y: number;
  z: number;
  u: number;
  color: number;
}

export interface Polygon3D {
  nb_of_points: number;
  open: number;
  symmetry: number;
  symmetry_center: Point3D;
  plan: number;
  points: Point3D[];
}

export interface Bezier3D {
  name: string;
  degree: number;
  open: number;
  symmetry: number;
  plan: number;
  control_points: Polygon3D;
  tangents_1: Polygon3D;
  tangents_2: Polygon3D;
  tangents_m: Polygon3D;
  control_type_points: number[];
  tangent_type_points: number[];
}

export interface Couple {
  dessus: number;
  dessous: number;
  displayed: number;
  bezier: Bezier3D;
}

export interface Board {
  version: number;
  version_number: string;
  name: string;
  author: string;
  comment: string;
  variation: string;
  category: string;
  category_type: string;
  construction: string;
  rider_name: string;
  rider_weight: number;

  // Board dimensions
  length: number;
  length_dev: number;
  width: number;
  thickness: number;
  tail_rocker: number;
  nose_rocker: number;
  volume: number;
  surface_proj: number;

  // Additional measurements
  volume_tail: number;
  volume_nose: number;
  surface_proj_tail: number;
  surface_proj_nose: number;

  // Main curves
  otl: Bezier3D;        // Outline
  str_bot: Bezier3D;    // Stringer bottom
  str_deck: Bezier3D;   // Stringer deck

  // Cross-sections
  number_of_slices: number;
  couples: Couple[];

  // Display properties
  color: number;
  color_bot: number;
  color_rail: number;
}

export interface Lighting {
  version: number;
  ecl: Point3D;
  color: number;
  color_spot: number;
  intensity: number;
  intensity2: number;
  intensity_ambient: number;
  intensity_spec: number;
}

export interface View {
  version: number;
  wh: number;
  ww: number;
  wox: number;
  woy: number;
  uh: number;
  uw: number;
  uxmin: number;
  uymin: number;
  cxy: number;
  mrgx: number;
  mrgy: number;
  police: string;
  over_sample: number;
  grid: number;
}

export interface Camera {
  version: number;
  alpha: number;
  dim_obj: number;
  crot: Point3D;
  cvis: Point3D;
  ccam: Point3D;
  oy: Point3D;
  ur: Point3D;
  view: View;
}

export interface Scene {
  version: number;
  background_color: number;
  lighting: Lighting;
  camera: Camera;
  reflexion_map: string;
  display_sky_box: number;
}

export interface Shape3DDesign {
  board: Board;
  scene: Scene;
}