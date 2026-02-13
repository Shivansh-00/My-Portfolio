"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════
   SPIDER-MAN UNIVERSE — Immersive Web-Swinging Cityscape
   ══════════════════════════════════════════════════════════════
   Features:
   • Procedural city skyline with parallax depth
   • Dynamic web structures with elastic tension simulation
   • Particle-based web dissolution & city dust
   • Volumetric fog & atmospheric depth
   • Motion-tracked parallax camera
   • Custom GLSL shaders for all effects
   • GPU-instanced building rendering
   • Real-time web-shooting trail effect
   ══════════════════════════════════════════════════════════════ */

/* ── COLOUR PALETTE (Spider-Man) ── */
const SPIDEY_RED    = "#DC143C";
const SPIDEY_BLUE   = "#1E3A8A";
const WEB_SILVER    = "#C8D6E5";
const CITY_DARK     = "#0A1628";
const CITY_LIGHT    = "#1A2A48";
const SKY_DEEP      = "#060618";
const ACCENT_GOLD   = "#FFD700";

/* ══════════════════════════════════════════════════════════════
   WEB NETWORK — Procedural spider-web structure with tension
   ══════════════════════════════════════════════════════════════ */

const webNetVS = `
  attribute float aPhase;
  attribute float aTension;
  uniform float uTime;
  uniform float uMouse;
  varying float vAlpha;
  varying float vTension;

  void main() {
    vec3 pos = position;

    // Elastic web tension — nodes oscillate based on phase
    float wave = sin(uTime * 1.5 + aPhase * 6.28) * aTension * 0.3;
    pos.x += wave * 0.5;
    pos.y += sin(uTime * 0.8 + aPhase * 3.14) * aTension * 0.15;

    // Mouse-reactive displacement
    pos.x += uMouse * aTension * 0.8;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float dist = length(mvPos.xyz);
    vAlpha = smoothstep(80.0, 5.0, dist) * (0.3 + aTension * 0.4);
    vTension = aTension;
  }
`;

const webNetFS = `
  varying float vAlpha;
  varying float vTension;

  void main() {
    // Silver-white web color with tension-based brightness
    vec3 webColor = vec3(0.78, 0.84, 0.90);
    vec3 tensionColor = vec3(0.95, 0.97, 1.0);
    vec3 col = mix(webColor, tensionColor, vTension * 0.6);

    gl_FragColor = vec4(col, vAlpha * 0.5);
  }
`;

function WebNetwork() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const mouseRef = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const { positions, phases, tensions, indices } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const ph: number[] = [];
    const tn: number[] = [];

    // Generate web anchor points in a radial pattern
    const rings = 6;
    const spokes = 16;

    // Center node
    nodes.push(new THREE.Vector3(0, 0, 0));
    ph.push(0);
    tn.push(0.1);

    for (let r = 1; r <= rings; r++) {
      const radius = r * 2.5;
      for (let s = 0; s < spokes; s++) {
        const angle = (s / spokes) * Math.PI * 2 + (r % 2 === 0 ? Math.PI / spokes : 0);
        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
        const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.8;
        const z = (Math.random() - 0.5) * 2;
        nodes.push(new THREE.Vector3(x, y, z));
        ph.push(Math.random() * Math.PI * 2);
        tn.push(0.2 + Math.random() * 0.6);
      }
    }

    // Build line indices — spokes from center + ring connections
    const idx: number[] = [];

    // Spokes from center to first ring
    for (let s = 0; s < spokes; s++) {
      idx.push(0, 1 + s);
    }

    // Ring connections + cross connections
    for (let r = 0; r < rings; r++) {
      const ringStart = 1 + r * spokes;
      for (let s = 0; s < spokes; s++) {
        const current = ringStart + s;
        const next = ringStart + (s + 1) % spokes;
        idx.push(current, next); // Ring segment

        // Radial to next ring
        if (r < rings - 1) {
          const outerIdx = ringStart + spokes + s;
          idx.push(current, outerIdx);
          // Diagonal cross-threads
          if (s % 3 === 0) {
            idx.push(current, ringStart + spokes + (s + 1) % spokes);
          }
        }
      }
    }

    const posArr = new Float32Array(nodes.length * 3);
    const phArr = new Float32Array(nodes.length);
    const tnArr = new Float32Array(nodes.length);
    nodes.forEach((n, i) => {
      posArr[i * 3] = n.x;
      posArr[i * 3 + 1] = n.y;
      posArr[i * 3 + 2] = n.z;
      phArr[i] = ph[i];
      tnArr[i] = tn[i];
    });

    return {
      positions: posArr,
      phases: phArr,
      tensions: tnArr,
      indices: new Uint16Array(idx),
    };
  }, []);

  useFrame((s) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
      matRef.current.uniforms.uMouse.value +=
        (mouseRef.current - matRef.current.uniforms.uMouse.value) * 0.02;
    }
  });

  return (
    <lineSegments position={[0, 2, -8]} rotation={[0.15, 0, 0.05]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aTension" args={[tensions, 1]} />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={webNetVS}
        fragmentShader={webNetFS}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* ══════════════════════════════════════════════════════════════
   CITY SKYLINE — Procedural instanced buildings
   ══════════════════════════════════════════════════════════════ */

const cityVS = `
  attribute vec3 aOffset;
  attribute vec3 aScale;
  attribute float aLit;
  varying float vLit;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    vec3 pos = position * aScale + aOffset;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    vLit = aLit;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const cityFS = `
  uniform float uTime;
  varying float vLit;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    // Base building color — dark blue/navy
    vec3 baseColor = vec3(0.04, 0.08, 0.16);
    vec3 litColor = vec3(0.08, 0.14, 0.28);

    // Window lights — grid pattern
    vec2 windowUV = fract(vWorldPos.xz * 2.0 + vWorldPos.y * 3.0);
    float windowPattern = step(0.6, windowUV.x) * step(0.7, windowUV.y);

    // Randomly lit windows
    float windowSeed = floor(vWorldPos.x * 2.0) + floor(vWorldPos.y * 3.0) * 17.0 + floor(vWorldPos.z * 2.0) * 31.0;
    float windowOn = step(0.55, fract(sin(windowSeed) * 43758.5453));

    // Window color — warm yellows and cool blues
    vec3 warmLight = vec3(1.0, 0.85, 0.5);
    vec3 coolLight = vec3(0.5, 0.7, 1.0);
    float lightType = step(0.6, fract(sin(windowSeed * 1.7) * 12345.6));
    vec3 windowColor = mix(warmLight, coolLight, lightType);

    // Flicker some windows
    float flicker = step(0.92, fract(sin(windowSeed + uTime * 0.3) * 9876.5));
    windowOn *= (1.0 - flicker * 0.5);

    vec3 col = mix(baseColor, litColor, vLit * 0.3);
    col += windowColor * windowPattern * windowOn * vLit * 0.8;

    // Edge highlighting (silhouette)
    float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    col += vec3(0.12, 0.16, 0.35) * pow(edge, 3.0) * 0.5;

    // Distance fog
    float fogDist = length(vWorldPos.xz) * 0.008;
    col = mix(col, vec3(0.02, 0.04, 0.08), clamp(fogDist, 0.0, 0.85));

    // Red accent on top edges (Spider-Man glow from above)
    float topGlow = smoothstep(0.0, 1.0, vNormal.y) * 0.15;
    col += vec3(0.86, 0.08, 0.24) * topGlow;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const BUILDING_COUNT = 120;

function CityBuildings() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { offsets, scales, lits } = useMemo(() => {
    const off = new Float32Array(BUILDING_COUNT * 3);
    const sc = new Float32Array(BUILDING_COUNT * 3);
    const lt = new Float32Array(BUILDING_COUNT);

    for (let i = 0; i < BUILDING_COUNT; i++) {
      // Distribute buildings in a city grid with gaps
      const row = Math.floor(i / 12);
      const col = i % 12;
      const x = (col - 6) * 8 + (Math.random() - 0.5) * 3;
      const z = -20 - row * 7 + (Math.random() - 0.5) * 2;
      const height = 3 + Math.random() * 18;
      const width = 1.5 + Math.random() * 3;
      const depth = 1.5 + Math.random() * 3;

      off[i * 3] = x;
      off[i * 3 + 1] = height * 0.5 - 12; // base at ground
      off[i * 3 + 2] = z;
      sc[i * 3] = width;
      sc[i * 3 + 1] = height;
      sc[i * 3 + 2] = depth;
      lt[i] = 0.3 + Math.random() * 0.7;
    }
    return { offsets: off, scales: sc, lits: lt };
  }, []);

  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    const box = new THREE.BoxGeometry(1, 1, 1);
    geo.index = box.index;
    geo.attributes.position = box.attributes.position;
    geo.attributes.normal = box.attributes.normal;
    geo.attributes.uv = box.attributes.uv;

    geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 3));
    geo.setAttribute("aLit", new THREE.InstancedBufferAttribute(lits, 1));

    return geo;
  }, [offsets, scales, lits]);

  return (
    <mesh frustumCulled={false}>
      <primitive object={geometry} />
      <shaderMaterial
        ref={matRef}
        vertexShader={cityVS}
        fragmentShader={cityFS}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   WEB-SWING TRAIL — Dynamic web line shooting across the scene
   ══════════════════════════════════════════════════════════════ */

const webTrailVS = `
  varying float vProgress;
  void main() {
    vProgress = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const webTrailFS = `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vProgress;

  void main() {
    float t = fract(uTime * 0.3);

    // Beam traveling along the web line
    float beam = smoothstep(0.0, 0.06, vProgress - t + 0.1) *
                 smoothstep(0.15, 0.06, vProgress - t);
    float glow = exp(-abs(vProgress - t) * 12.0) * 0.3;
    float baseLine = 0.06;

    float alpha = (beam * 0.8 + glow + baseLine) * 0.7;

    // Fade ends
    alpha *= smoothstep(0.0, 0.05, vProgress) * smoothstep(1.0, 0.95, vProgress);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function WebTrail({
  points,
  color = WEB_SILVER,
  speed = 1.0,
}: {
  points: [number, number, number][];
  color?: string;
  speed?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const curve = useMemo(() => {
    const vecs = points.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(vecs, false, "chordal");
  }, [points]);

  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime * speed;
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.012, 4, false]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={webTrailVS}
        fragmentShader={webTrailFS}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   ATMOSPHERIC PARTICLES — City dust, web sparkles, ambient
   ══════════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 500;

const particleVS = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aType;
  uniform float uTime;
  varying float vAlpha;
  varying float vType;

  void main() {
    vec3 pos = position;

    // Different movement for different particle types
    float t = uTime * aSpeed;

    // Upward drift (city thermals)
    pos.y += mod(t * 0.8 + aPhase * 10.0, 40.0) - 20.0;

    // Horizontal drift (wind)
    pos.x += sin(t * 0.3 + aPhase * 5.0) * 2.0;
    pos.z += cos(t * 0.2 + aPhase * 3.0) * 1.5;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mv.xyz);
    gl_PointSize = aSize * (100.0 / dist);
    gl_Position = projectionMatrix * mv;

    vAlpha = smoothstep(60.0, 8.0, dist) * (0.3 + 0.3 * sin(uTime * 1.2 + aPhase));
    vType = aType;
  }
`;

const particleFS = `
  varying float vAlpha;
  varying float vType;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = smoothstep(1.0, 0.2, d) * vAlpha * 0.5;

    // Red particles (spider glow), silver particles (web dust), blue particles (city)
    vec3 redCol = vec3(0.86, 0.08, 0.24);
    vec3 silverCol = vec3(0.78, 0.84, 0.90);
    vec3 blueCol = vec3(0.12, 0.23, 0.54);

    vec3 col = vType < 0.33 ? redCol : vType < 0.66 ? silverCol : blueCol;

    gl_FragColor = vec4(col, a);
  }
`;

function AtmosphericParticles() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes, speeds, phases, types } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    const sp = new Float32Array(PARTICLE_COUNT);
    const ph = new Float32Array(PARTICLE_COUNT);
    const tp = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 35;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = Math.sin(theta) * r - 10;
      sz[i] = 0.5 + Math.random() * 2.5;
      sp[i] = 0.15 + Math.random() * 0.5;
      ph[i] = Math.random() * Math.PI * 2;
      tp[i] = Math.random();
    }
    return { positions: pos, sizes: sz, speeds: sp, phases: ph, types: tp };
  }, []);

  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={PARTICLE_COUNT} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} count={PARTICLE_COUNT} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} count={PARTICLE_COUNT} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} count={PARTICLE_COUNT} />
        <bufferAttribute attach="attributes-aType" args={[types, 1]} count={PARTICLE_COUNT} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVS}
        fragmentShader={particleFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPIDER-SIGNAL — Volumetric light beam in the sky
   ══════════════════════════════════════════════════════════════ */

const signalVS = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const signalFS = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float r = length(c);
    float angle = atan(c.y, c.x);

    // Central glow — Spider symbol silhouette approximation
    float core = exp(-r * 6.0) * 1.0;

    // Concentric web rings
    float ring1 = smoothstep(0.004, 0.0, abs(r - 0.18)) * 0.8;
    float ring2 = smoothstep(0.003, 0.0, abs(r - 0.35)) * 0.5;
    float ring3 = smoothstep(0.003, 0.0, abs(r - 0.55)) * 0.35;
    float ring4 = smoothstep(0.002, 0.0, abs(r - 0.75)) * 0.2;

    // Radial web spokes
    float spokes = smoothstep(0.01, 0.0, abs(sin(angle * 4.0))) * 0.15 * smoothstep(0.1, 0.2, r);
    float spokes2 = smoothstep(0.015, 0.0, abs(sin(angle * 8.0 + uTime * 0.2))) * 0.08 * smoothstep(0.3, 0.5, r);

    // Pulsing energy
    float pulse = smoothstep(0.03, 0.0, abs(r - fract(uTime * 0.35) * 0.9)) * 0.5;

    float total = core + ring1 + ring2 + ring3 + ring4 + spokes + spokes2 + pulse;

    // Spider-Man red core fading to blue edge
    vec3 redCol = vec3(0.86, 0.08, 0.24);
    vec3 blueCol = vec3(0.12, 0.23, 0.54);
    vec3 whiteCol = vec3(0.9, 0.93, 1.0);
    vec3 col = mix(redCol, blueCol, smoothstep(0.0, 0.7, r));
    col = mix(col, whiteCol, core * 0.5);
    col += vec3(1.0, 0.85, 0.2) * pulse * 0.2; // gold pulse

    float alpha = total * smoothstep(0.9, 0.4, r);
    gl_FragColor = vec4(col, alpha * 0.7);
  }
`;

function SpiderSignal() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 1, -6]}>
      <planeGeometry args={[16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={signalVS}
        fragmentShader={signalFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   VOLUMETRIC FOG FLOOR — Ground-level atmospheric haze
   ══════════════════════════════════════════════════════════════ */

const fogFloorVS = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorldPos = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fogFloorFS = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simple noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;

    // Multi-layered noise for fog movement
    float n1 = noise(uv * 8.0 + uTime * 0.15);
    float n2 = noise(uv * 16.0 - uTime * 0.1);
    float n3 = noise(uv * 4.0 + vec2(uTime * 0.08, 0.0));
    float fog = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2);

    // Edge fade
    float edgeFade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
    edgeFade *= smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);

    // Distance-based fade
    float dist = length(vWorldPos.xz) * 0.015;
    float distFade = 1.0 - clamp(dist, 0.0, 1.0);

    float alpha = fog * edgeFade * distFade * 0.25;

    // Blue-tinted fog with red accent
    vec3 fogColor = vec3(0.06, 0.10, 0.20);
    fogColor += vec3(0.4, 0.02, 0.08) * n3 * 0.3; // Subtle red mist

    gl_FragColor = vec4(fogColor, alpha);
  }
`;

function VolumetricFogFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, -10]}>
      <planeGeometry args={[120, 80]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={fogFloorVS}
        fragmentShader={fogFloorFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   STREET GRID — Neon-lit street lines below the city
   ══════════════════════════════════════════════════════════════ */

const streetVS = `
  varying vec2 vUv;
  varying vec3 vWP;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWP = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const streetFS = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWP;

  void main() {
    vec2 c = vUv * 40.0;
    vec2 g = abs(fract(c) - 0.5);
    float line = min(g.x, g.y);
    float grid = 1.0 - smoothstep(0.0, 0.025, line);

    // Major streets
    vec2 c5 = vUv * 8.0;
    vec2 g5 = abs(fract(c5) - 0.5);
    float majorLine = min(g5.x, g5.y);
    float majorGrid = 1.0 - smoothstep(0.0, 0.015, majorLine);

    // Distance fade
    float dist = smoothstep(50.0, 5.0, length(vWP.xz));
    float horizon = (1.0 - vUv.y) * 0.85;

    // Moving car lights (red/white streaks on major streets)
    float carLight = smoothstep(0.015, 0.0, abs(fract(c5.y) - 0.5)) *
                     smoothstep(0.0, 0.02, abs(fract(c5.x + uTime * 0.2) - 0.5)) *
                     0.4;

    // Pulse from center
    float dc = length(vWP.xz);
    float pulse = smoothstep(1.5, 0.0, abs(dc - mod(uTime * 6.0, 60.0))) * 0.25;

    float alpha = (grid * 0.04 + majorGrid * 0.12 + carLight + pulse) * dist * horizon;

    // Red-blue street glow
    vec3 baseCol = vec3(0.12, 0.15, 0.35);
    vec3 redGlow = vec3(0.86, 0.08, 0.24);
    vec3 col = baseCol + redGlow * pulse * 0.5;
    col += vec3(0.9, 0.85, 0.5) * carLight; // car headlights

    gl_FragColor = vec4(col, alpha);
  }
`;

function StreetGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12.5, -15]}>
      <planeGeometry args={[100, 60]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={streetVS}
        fragmentShader={streetFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   PARALLAX CAMERA — Smooth mouse-reactive depth + gentle sway
   ══════════════════════════════════════════════════════════════ */

function ParallaxCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useFrame((s) => {
    // Gentle breathing sway + mouse tracking
    const t = s.clock.elapsedTime;
    const targetX = mouse.current.x * 1.5 + Math.sin(t * 0.15) * 0.3;
    const targetY = -mouse.current.y * 0.8 + Math.cos(t * 0.12) * 0.2;

    camera.position.x += (targetX - camera.position.x) * 0.015;
    camera.position.y += (targetY - camera.position.y) * 0.015;
    camera.lookAt(0, -2, -10);
  });

  return null;
}

/* ══════════════════════════════════════════════════════════════
   MAIN SCENE — Spider-Man Universe Composition
   ══════════════════════════════════════════════════════════════ */

function Scene() {
  const webTrails = useMemo(
    () => [
      {
        pts: [[-25, 8, -15], [-15, 4, -8], [-5, 6, -5], [5, 2, -6]] as [number, number, number][],
        c: WEB_SILVER,
        s: 0.8,
      },
      {
        pts: [[25, 6, -15], [15, 2, -8], [5, 5, -5], [-5, 0, -6]] as [number, number, number][],
        c: WEB_SILVER,
        s: 1.2,
      },
      {
        pts: [[-20, -2, -20], [-10, 5, -12], [0, 8, -8], [10, 4, -10]] as [number, number, number][],
        c: "#E8EDF5",
        s: 0.6,
      },
      {
        pts: [[0, -5, -18], [8, 0, -10], [15, 6, -12], [22, 3, -18]] as [number, number, number][],
        c: WEB_SILVER,
        s: 1.0,
      },
      {
        pts: [[-15, 10, -20], [-5, 6, -14], [5, 9, -10], [15, 5, -14]] as [number, number, number][],
        c: "#C8D6E5",
        s: 0.5,
      },
    ],
    []
  );

  return (
    <>
      <ParallaxCamera />

      {/* Spider signal — central web pattern */}
      <SpiderSignal />

      {/* Web network — radial spider-web structure */}
      <WebNetwork />

      {/* City skyline — instanced buildings */}
      <CityBuildings />

      {/* Web swing trails — dynamic silk lines */}
      {webTrails.map((t, i) => (
        <WebTrail key={i} points={t.pts} color={t.c} speed={t.s} />
      ))}

      {/* Atmospheric particles */}
      <AtmosphericParticles />

      {/* Volumetric fog floor */}
      <VolumetricFogFloor />

      {/* Street grid */}
      <StreetGrid />

      {/* Lighting — Spider-Man themed */}
      <ambientLight intensity={0.04} color="#1A2A48" />
      <pointLight position={[0, 10, 5]} intensity={0.6} color={SPIDEY_RED} distance={40} decay={2} />
      <pointLight position={[-15, 5, -8]} intensity={0.3} color={SPIDEY_BLUE} distance={50} decay={2} />
      <pointLight position={[15, -3, -8]} intensity={0.2} color={WEB_SILVER} distance={35} decay={2} />
      <pointLight position={[0, -10, -5]} intensity={0.15} color="#3B82F6" distance={30} decay={2} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXPORT — Spider-Man Universe Background
   ══════════════════════════════════════════════════════════════ */

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 2, 20], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5 }}
        flat
      >
        <Scene />
      </Canvas>

      {/* CSS Bloom/Glow layer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          mixBlendMode: "screen",
          filter: "blur(8px) brightness(0.3)",
          opacity: 0.4,
          background: "transparent",
        }}
      />

      {/* Vignette overlay — dramatic Spider-Man framing */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(6,6,24,0.75) 100%)",
        }}
      />

      {/* Red accent tint in corners */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "linear-gradient(135deg, rgba(220,20,60,0.15) 0%, transparent 20%, transparent 80%, rgba(30,58,138,0.1) 100%)",
        }}
      />
    </div>
  );
}
