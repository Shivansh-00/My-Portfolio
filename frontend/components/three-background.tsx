"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* ── Floating particles that drift through space ── */
function CyberParticles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const geo = mesh.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];
      // Wrap around bounds
      for (let j = 0; j < 3; j++) {
        if (Math.abs(arr[i * 3 + j]) > 25) {
          arr[i * 3 + j] *= -0.95;
        }
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#00f0ff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Wireframe rotating geometry ring ── */
function DataRing({ radius = 8, speed = 0.15 }: { radius?: number; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.3;
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.z += delta * speed * 0.1;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0.12}
        wireframe
      />
    </mesh>
  );
}

/* ── Moving grid floor ── */
function CyberGrid() {
  const ref = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#00f0ff") },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          vec2 grid = abs(fract(vUv * 20.0 - vec2(0.0, uTime * 0.1)) - 0.5);
          float line = min(grid.x, grid.y);
          float alpha = 1.0 - smoothstep(0.0, 0.05, line);
          alpha *= (1.0 - vUv.y) * 0.15;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[80, 40, 1, 1]} />
      <shaderMaterial ref={materialRef} args={[shaderArgs]} />
    </mesh>
  );
}

/* ── Floating hexagon ── */
function FloatingHex({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z += 0.003;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime + offset) * 0.5;
  });

  return (
    <mesh ref={ref} position={position}>
      <circleGeometry args={[0.4, 6]} />
      <meshBasicMaterial
        color="#a855f7"
        transparent
        opacity={0.08}
        wireframe
      />
    </mesh>
  );
}

/* ── Main Scene exported ── */
function Scene() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group>(null!);

  const handlePointerMove = useCallback((e: THREE.Event) => {
    const event = e as unknown as { clientX: number; clientY: number };
    mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y +=
      (mouseRef.current.x * 0.02 - groupRef.current.rotation.y) * 0.02;
    groupRef.current.rotation.x +=
      (mouseRef.current.y * 0.01 - groupRef.current.rotation.x) * 0.02;
  });

  const hexPositions = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: 15 }, () => [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 5,
      ]),
    []
  );

  return (
    <>
      <group ref={groupRef}>
        <CyberParticles count={300} />
        <DataRing radius={10} speed={0.1} />
        <DataRing radius={14} speed={-0.07} />
        <DataRing radius={6} speed={0.15} />
        {hexPositions.map((pos, i) => (
          <FloatingHex key={i} position={pos} />
        ))}
      </group>
      <CyberGrid />
      <Stars
        radius={50}
        depth={60}
        count={1500}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#00f0ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color="#ff00e5" />
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
        onPointerMove={(e) => {
          // Forward to scene via global event
          window.dispatchEvent(
            new CustomEvent("scene-pointer", {
              detail: { x: e.clientX, y: e.clientY },
            })
          );
        }}
      >
        <Scene />
      </Canvas>
      {/* Scanline overlay */}
      <div className="scan-lines" />
    </div>
  );
}
