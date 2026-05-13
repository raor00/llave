"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { Mesh, Group } from "three";

function House() {
  const group = useRef<Group>(null);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = window.innerHeight * 1.5;
      const v = Math.min(1, window.scrollY / max);
      setScroll(v);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetY = scroll * Math.PI * 1.4;
    group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(1, delta * 4);
    const targetScale = 1 + scroll * 0.18;
    group.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale } as unknown as Mesh["scale"],
      Math.min(1, delta * 4)
    );
  });

  return (
    <group ref={group} position={[0, -0.4, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 1.6]} />
        <meshStandardMaterial color="#f7f1e1" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.7, 1, 4]} />
        <meshStandardMaterial color="#0e6f4a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0.81]} castShadow>
        <boxGeometry args={[0.55, 1.05, 0.08]} />
        <meshStandardMaterial color="#0a563a" />
      </mesh>
      <mesh position={[0.7, 0.7, 0.81]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.06]} />
        <meshStandardMaterial color="#bfe1d1" emissive="#6ec79c" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.7, 0.7, 0.81]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.06]} />
        <meshStandardMaterial color="#bfe1d1" emissive="#6ec79c" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.7, -0.81]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.06]} />
        <meshStandardMaterial color="#bfe1d1" emissive="#f4c95d" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.5, 1.9, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color="#cbb27b" />
      </mesh>
      {/* floating key */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2} position={[2.2, 1.6, 0.4]}>
        <group rotation={[0, 0, Math.PI / 6]}>
          <mesh castShadow>
            <torusGeometry args={[0.22, 0.06, 16, 36]} />
            <meshStandardMaterial color="#f4c95d" metalness={0.6} roughness={0.25} />
          </mesh>
          <mesh position={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 0.08, 0.08]} />
            <meshStandardMaterial color="#f4c95d" metalness={0.6} roughness={0.25} />
          </mesh>
          <mesh position={[0.7, -0.08, 0]} castShadow>
            <boxGeometry args={[0.08, 0.12, 0.08]} />
            <meshStandardMaterial color="#f4c95d" metalness={0.6} roughness={0.25} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [3.2, 2.1, 4.3], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 7, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#f4c95d" />
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
          <House />
        </Float>
        <ContactShadows position={[0, -0.42, 0]} opacity={0.5} scale={8} blur={2.6} far={4} />
        <Environment preset="apartment" />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 3.6}
        />
      </Canvas>
    </div>
  );
}
