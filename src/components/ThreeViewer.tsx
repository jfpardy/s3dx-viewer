import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Shape3DDesign } from '../types/s3dx';
import { BoardCADMeshGenerator } from '../utils/boardcadMeshGenerator';

interface ThreeViewerProps {
  design: Shape3DDesign | null;
  className?: string;
}

interface ViewerError {
  message: string;
  details?: string;
}

/**
 * Professional 3D surfboard viewer component using Three.js
 * 
 * Features:
 * - WebGL-based 3D rendering with proper error handling
 * - Interactive camera controls (orbit, pan, zoom)
 * - Automatic camera positioning based on surfboard dimensions
 * - Memory management with proper cleanup
 * - Responsive design with resize handling
 */
export const ThreeViewer: React.FC<ThreeViewerProps> = ({ design, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const surfboardObjectsRef = useRef<THREE.Object3D[]>([]);
  
  const [error, setError] = useState<ViewerError | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    try {
      // Initialize WebGL renderer with error handling
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      
      // Check for WebGL support
      if (!renderer.capabilities.isWebGL2) {
        console.warn('WebGL2 not supported, falling back to WebGL1');
      }

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x222222);
      sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, -5, 3); // Further back to see more
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Configure renderer settings
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);


    // Axes helper - make it large enough to always be visible
    const axesHelper = new THREE.AxesHelper(10); // 10 meters length
    scene.add(axesHelper);

    // OrbitControls for camera manipulation  
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    
    // Enable controls
    controls.update();

    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Update controls - this is critical for OrbitControls to work
      controls.update();
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    
    } catch (err) {
      console.error('Error initializing 3D viewer:', err);
      setError({
        message: 'Failed to initialize 3D viewer',
        details: err instanceof Error ? err.message : 'WebGL initialization failed'
      });
    }
  }, []);

  useEffect(() => {
    if (!design || !sceneRef.current) return;

    // Clean up previous surfboard objects
    surfboardObjectsRef.current.forEach(obj => {
      sceneRef.current!.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    surfboardObjectsRef.current = [];
    
    try {
      // Generate the surfboard mesh using BoardCAD method
      const meshGenerator = new BoardCADMeshGenerator();
      const surfboardMesh = meshGenerator.generateMesh(design);
      
      if (!surfboardMesh) {
        throw new Error('Failed to generate surfboard mesh');
      }
    
    // Calculate bounding box from the mesh
    const box = new THREE.Box3().setFromObject(surfboardMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    
    // Center the surfboard at origin (0,0,0)
    surfboardMesh.position.sub(center);
    
    // Position camera to see the entire surfboard
    const camera = cameraRef.current!;
    const controls = controlsRef.current!;
    
    // Set camera position based on bounding box size (now centered at origin)
    const distance = maxSize * 2; // Distance from center
    camera.position.set(distance * 0.7, -distance * 0.5, distance * 0.5);
    controls.target.set(0, 0, 0); // Look at origin
    controls.update();
    
      // Add the mesh to the scene
      sceneRef.current!.add(surfboardMesh);
      surfboardObjectsRef.current.push(surfboardMesh);
      
      // Clear any previous errors
      setError(null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error generating surfboard mesh:', err);
      setError({
        message: 'Failed to generate 3D model',
        details: errorMessage
      });
    }
  }, [design]);

  // Error display component
  if (error) {
    return (
      <div 
        className={className}
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '8px'
        }}
      >
        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
          ⚠️ {error.message}
        </div>
        {error.details && (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
            {error.details}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={mountRef} 
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
};