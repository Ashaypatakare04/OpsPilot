'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroCore3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.2, 7.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for entire interactive assembly
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Core: Icosahedron / Octahedron with wireframe + glowing inner core
    const coreGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Wireframe overlay on core
    const wireGeo = new THREE.IcosahedronGeometry(1.26, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    mainGroup.add(wireMesh);

    // Inner warm nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.2,
      roughness: 0.3,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    mainGroup.add(nucleusMesh);

    // 2. Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.7 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    mainGroup.add(ring2);

    // 3. Orbital Satellites / Nodes
    // [Invoice, Purchase Order, Vendor, Risk Signal, Human Gate, Audit Trail]
    const satellites = [
      { name: 'Invoice Ingestion', color: 0x38bdf8, dist: 2.4, angle: 0, speed: 0.008, yOffset: 0.4 },
      { name: 'Purchase Order', color: 0x818cf8, dist: 2.4, angle: Math.PI * 0.66, speed: 0.008, yOffset: -0.2 },
      { name: 'Vendor Registry', color: 0x34d399, dist: 2.4, angle: Math.PI * 1.33, speed: 0.008, yOffset: 0.1 },
      { name: 'Risk Engine', color: 0xf59e0b, dist: 3.2, angle: 0.8, speed: -0.006, yOffset: 0.5 },
      { name: 'Human Approval Gate', color: 0xf43f5e, dist: 3.2, angle: 2.8, speed: -0.006, yOffset: -0.4 },
      { name: 'Audit Trail', color: 0xa78bfa, dist: 3.2, angle: 4.8, speed: -0.006, yOffset: 0.2 },
    ];

    const satMeshes: { mesh: THREE.Mesh; config: (typeof satellites)[0]; line: THREE.Line }[] = [];

    satellites.forEach((sat) => {
      const sGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
      const sMat = new THREE.MeshStandardMaterial({
        color: sat.color,
        emissive: sat.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      mainGroup.add(sMesh);

      // Data connection beam to core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: sat.color,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      mainGroup.add(line);

      satMeshes.push({ mesh: sMesh, config: sat, line });
    });

    // 4. Background Data Particle Field
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.8);
    dirLight2.position.set(-5, -3, 3);
    scene.add(dirLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize Handler
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse rotation with damping
      targetRotationY = mouseX * 0.4;
      targetRotationX = mouseY * 0.3;

      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

      // Pulse core
      coreMesh.rotation.y += 0.007;
      coreMesh.rotation.x += 0.004;
      wireMesh.rotation.y -= 0.005;
      wireMesh.rotation.z += 0.003;

      const scale = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
      nucleusMesh.scale.set(scale, scale, scale);

      // Rotate orbital rings
      ring1.rotation.z += 0.003;
      ring2.rotation.z -= 0.002;

      // Update Satellites
      satMeshes.forEach((item) => {
        item.config.angle += item.config.speed;
        const x = Math.cos(item.config.angle) * item.config.dist;
        const z = Math.sin(item.config.angle) * item.config.dist;
        const y = Math.sin(item.config.angle * 2) * 0.35 + item.config.yOffset;

        item.mesh.position.set(x, y, z);
        item.mesh.rotation.x += 0.015;
        item.mesh.rotation.y += 0.02;

        // Update beam line positions
        const positions = item.line.geometry.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, 0, 0, 0);
        positions.setXYZ(1, x, y, z);
        positions.needsUpdate = true;
      });

      // Drift background particles
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] overflow-hidden flex items-center justify-center">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Spatial Context HUD */}
      <div className="pointer-events-none absolute bottom-6 inset-x-6 flex items-center justify-between text-xs text-graphite-400 font-mono">
        <div className="flex items-center gap-2 bg-canvas-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-canvas-700/60 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>OPSPILOT CORE: ACTIVE RUNTIME</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-canvas-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-canvas-700/60 shadow-lg">
          <span className="text-graphite-300">AUTONOMY GATE: ENFORCED</span>
          <span className="text-amber-400">HUMAN-IN-THE-LOOP: READY</span>
        </div>
      </div>
    </div>
  );
};
