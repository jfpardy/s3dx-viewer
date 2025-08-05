# S3DX Viewer

A modern web-based 3D viewer for S3DX surfboard design files, built with React, TypeScript, and Three.js.

## Features

- **3D Visualization** - Interactive 3D rendering with realistic surfboard geometry
- **S3DX Format Support** - Full parsing of BoardCAD's S3DX file format
- **BoardCAD-Compatible Mesh Generation** - Implements S-Linear interpolation algorithm
- **Interactive Controls** - Rotate, pan, and zoom with mouse/touch controls
- **Responsive Design** - Works on desktop and mobile devices

## Demo

Upload an S3DX surfboard design file to see it rendered in 3D with proper geometry and realistic proportions.
**[Demo Site](https://s3dx.jfpardy.com)**

## Technology Stack

- **React 19** + **TypeScript** - Modern UI with type safety
- **Three.js** - WebGL-based 3D graphics
- **Vite** - Fast build tool

## Getting Started

```bash
npm install
npm run dev
```

Open your browser to view the application. Upload an S3DX file or use the included sample file.

## S3DX Format

S3DX files are XML-based surfboard design files containing:
- Board dimensions and metadata
- Bezier curves for outline and rocker
- Cross-sectional profiles (couples)
- Control points and tangent vectors

## Controls

- **Left drag** - Rotate view
- **Right drag** - Pan camera  
- **Scroll** - Zoom in/out
- **Touch** - Full mobile support

## Build

```bash
npm run build
```

Built files will be in the `dist` directory, ready for deployment.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **BoardCAD** - Professional surfboard design software
- **Trident Project** - Reference implementation for S3DX algorithms
