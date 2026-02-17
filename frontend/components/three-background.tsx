"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════
   GOTHAM CITY — Cinematic Batman-Themed 3D Environment
   ══════════════════════════════════════════════════════════════
   Features:
   • Gothic city skyline with gargoyle-crowned towers
   • Volumetric Bat-Signal searchlight beam
   • Atmospheric rain particles with lightning flashes
   • Procedural fog rolling through dark streets
   • Shadow-heavy instanced gothic buildings
   • Dynamic parallax camera with breathing effect
   • Custom GLSL shaders for all cinematic effects
   • GPU-optimized particle systems (rain + embers)
   ══════════════════════════════════════════════════════════════ */

/* ── COLOUR PALETTE (Batman / Gotham) ── */
const BAT_GOLD     = "#D4A853";
const GOTHAM_DARK  = "#08080F";
const STEEL_GREY   = "#2D3748";
const NIGHT_BLUE   = "#0A1225";
const AMBER_GLOW   = "#F59E0B";
const CRIMSON_DARK = "#5C0A0A";

/* ══════════════════════════════════════════════════════════════
   BAT-SIGNAL — Volumetric light beam + bat silhouette
   ══════════════════════════════════════════════════════════════ */

const batSignalVS = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const batSignalFS = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float r = length(c);
    float angle = atan(c.y, c.x);

    // Central golden glow
    float core = exp(-r * 5.0) * 1.2;

    // Bat silhouette (simplified wing shape using math)
    vec2 bc = c * 3.0;
    // Wings: two ellipses
    float wingL = length(vec2(bc.x + 0.8, bc.y * 1.8)) * 0.7;
    float wingR = length(vec2(bc.x - 0.8, bc.y * 1.8)) * 0.7;
    float body = length(vec2(bc.x, bc.y * 2.5));
    float bat = 1.0 - smoothstep(0.5, 0.6, min(min(wingL, wingR), body));

    // Ears
    float earL = length(vec2(bc.x + 0.25, bc.y - 0.6));
    float earR = length(vec2(bc.x - 0.25, bc.y - 0.6));
    bat += (1.0 - smoothstep(0.1, 0.15, earL)) * 0.5;
    bat += (1.0 - smoothstep(0.1, 0.15, earR)) * 0.5;

    bat *= smoothstep(0.8, 0.2, r); // Fade bat shape at edges

    // Concentric rings (searchlight refraction)
    float ring1 = smoothstep(0.004, 0.0, abs(r - 0.25)) * 0.6;
    float ring2 = smoothstep(0.003, 0.0, abs(r - 0.45)) * 0.4;
    float ring3 = smoothstep(0.003, 0.0, abs(r - 0.65)) * 0.25;

    // Rotating searchlight spokes
    float spokes = smoothstep(0.015, 0.0, abs(sin(angle * 3.0 + uTime * 0.15))) * 0.08 * smoothstep(0.2, 0.5, r);

    // Pulsing energy wave
    float pulse = smoothstep(0.03, 0.0, abs(r - fract(uTime * 0.25) * 0.9)) * 0.4;

    float total = core + ring1 + ring2 + ring3 + spokes + pulse + bat * 0.6;

    // Gold core fading to steel at edges
    vec3 goldCol = vec3(0.83, 0.66, 0.33);
    vec3 steelCol = vec3(0.18, 0.22, 0.30);
    vec3 whiteCol = vec3(0.95, 0.90, 0.75);
    vec3 col = mix(goldCol, steelCol, smoothstep(0.0, 0.8, r));
    col = mix(col, whiteCol, core * 0.4);
    col += vec3(0.83, 0.66, 0.33) * bat * 0.3; // golden bat tint
    col += vec3(0.96, 0.84, 0.5) * pulse * 0.15;

    float alpha = total * smoothstep(0.95, 0.35, r);
    gl_FragColor = vec4(col, alpha * 0.6);
  }
`;

function BatSignal() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 3, -8]}>
      <planeGeometry args={[18, 18]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={batSignalVS}
        fragmentShader={batSignalFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   GOTHIC SKYLINE — Instanced dark towers with spires
   ══════════════════════════════════════════════════════════════ */

const gothicVS = `
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

const gothicFS = `
  uniform float uTime;
  varying float vLit;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    // Base building — ultra dark gothic stone
    vec3 baseColor = vec3(0.03, 0.03, 0.06);
    vec3 litColor = vec3(0.06, 0.06, 0.10);

    // Window pattern — sparse, warm amber
    vec2 windowUV = fract(vWorldPos.xz * 2.0 + vWorldPos.y * 3.0);
    float windowPattern = step(0.65, windowUV.x) * step(0.75, windowUV.y);

    float windowSeed = floor(vWorldPos.x * 2.0) + floor(vWorldPos.y * 3.0) * 17.0 + floor(vWorldPos.z * 2.0) * 31.0;
    float windowOn = step(0.72, fract(sin(windowSeed) * 43758.5453)); // fewer lit windows

    // Warm amber window light (Gotham warmth)
    vec3 warmLight = vec3(0.96, 0.75, 0.35);
    vec3 coldLight = vec3(0.4, 0.45, 0.55);
    float lightType = step(0.7, fract(sin(windowSeed * 1.7) * 12345.6));
    vec3 windowColor = mix(warmLight, coldLight, lightType);

    // Flicker
    float flicker = step(0.94, fract(sin(windowSeed + uTime * 0.2) * 9876.5));
    windowOn *= (1.0 - flicker * 0.6);

    vec3 col = mix(baseColor, litColor, vLit * 0.3);
    col += windowColor * windowPattern * windowOn * vLit * 0.6;

    // Edge highlighting — dark steel silhouette
    float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    col += vec3(0.08, 0.08, 0.15) * pow(edge, 3.0) * 0.4;

    // Fog
    float fogDist = length(vWorldPos.xz) * 0.01;
    vec3 fogColor = vec3(0.02, 0.02, 0.04);
    col = mix(col, fogColor, clamp(fogDist, 0.0, 0.9));

    // Gold accent on top (bat-signal reflection)
    float topGlow = smoothstep(0.0, 1.0, vNormal.y) * 0.08;
    col += vec3(0.83, 0.66, 0.33) * topGlow;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const BUILDING_COUNT = 140;

function GothicSkyline() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { offsets, scales, lits } = useMemo(() => {
    const off = new Float32Array(BUILDING_COUNT * 3);
    const sc = new Float32Array(BUILDING_COUNT * 3);
    const lt = new Float32Array(BUILDING_COUNT);

    for (let i = 0; i < BUILDING_COUNT; i++) {
      const row = Math.floor(i / 14);
      const col = i % 14;
      const x = (col - 7) * 7 + (Math.random() - 0.5) * 2.5;
      const z = -18 - row * 6 + (Math.random() - 0.5) * 2;
      // Gothic spires: taller, thinner buildings
      const height = 4 + Math.random() * 22;
      const width = 1.2 + Math.random() * 2.5;
      const depth = 1.2 + Math.random() * 2.5;

      off[i * 3] = x;
      off[i * 3 + 1] = height * 0.5 - 12;
      off[i * 3 + 2] = z;
      sc[i * 3] = width;
      sc[i * 3 + 1] = height;
      sc[i * 3 + 2] = depth;
      lt[i] = 0.2 + Math.random() * 0.6;
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
        vertexShader={gothicVS}
        fragmentShader={gothicFS}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   RAIN SYSTEM — GPU particle rain with streaks
   ══════════════════════════════════════════════════════════════ */

const RAIN_COUNT = 800;

const rainVS = `
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Rain falling
    float t = uTime * aSpeed;
    pos.y = mod(pos.y - t * 12.0 + aPhase * 40.0, 40.0) - 20.0;

    // Slight wind drift
    pos.x += sin(uTime * 0.3 + aPhase * 3.0) * 0.5;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mv.xyz);
    gl_PointSize = aSize * (60.0 / dist);
    gl_Position = projectionMatrix * mv;

    vAlpha = smoothstep(50.0, 5.0, dist) * 0.4;
  }
`;

const rainFS = `
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord;
    // Elongated raindrop shape
    float d = length(vec2(uv.x - 0.5, (uv.y - 0.5) * 0.3)) * 2.0;
    if (d > 1.0) discard;
    float a = smoothstep(1.0, 0.3, d) * vAlpha;

    // Steel-blue rain color
    vec3 rainColor = vec3(0.5, 0.55, 0.7);
    gl_FragColor = vec4(rainColor, a);
  }
`;

function RainParticles() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, speeds, phases, sizes } = useMemo(() => {
    const pos = new Float32Array(RAIN_COUNT * 3);
    const sp = new Float32Array(RAIN_COUNT);
    const ph = new Float32Array(RAIN_COUNT);
    const sz = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 40 - 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
      sp[i] = 0.8 + Math.random() * 0.6;
      ph[i] = Math.random() * Math.PI * 2;
      sz[i] = 1.0 + Math.random() * 2.0;
    }
    return { positions: pos, speeds: sp, phases: ph, sizes: sz };
  }, []);

  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={RAIN_COUNT} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} count={RAIN_COUNT} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} count={RAIN_COUNT} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} count={RAIN_COUNT} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={rainVS}
        fragmentShader={rainFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════════════════════
   ATMOSPHERIC EMBERS — Gold/amber floating particles
   ══════════════════════════════════════════════════════════════ */

const EMBER_COUNT = 400;

const emberVS = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aType;
  uniform float uTime;
  varying float vAlpha;
  varying float vType;

  void main() {
    vec3 pos = position;

    float t = uTime * aSpeed;

    // Upward drift (heat thermals from Gotham)
    pos.y += mod(t * 0.6 + aPhase * 10.0, 40.0) - 20.0;
    pos.x += sin(t * 0.2 + aPhase * 5.0) * 2.5;
    pos.z += cos(t * 0.15 + aPhase * 3.0) * 1.8;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mv.xyz);
    gl_PointSize = aSize * (80.0 / dist);
    gl_Position = projectionMatrix * mv;

    vAlpha = smoothstep(55.0, 6.0, dist) * (0.25 + 0.25 * sin(uTime * 1.5 + aPhase));
    vType = aType;
  }
`;

const emberFS = `
  varying float vAlpha;
  varying float vType;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = smoothstep(1.0, 0.15, d) * vAlpha * 0.5;

    // Gold embers, steel dust, dark amber sparks
    vec3 goldCol = vec3(0.83, 0.66, 0.33);
    vec3 steelCol = vec3(0.45, 0.5, 0.6);
    vec3 amberCol = vec3(0.96, 0.62, 0.04);

    vec3 col = vType < 0.33 ? goldCol : vType < 0.66 ? steelCol : amberCol;

    gl_FragColor = vec4(col, a);
  }
`;

function AtmosphericEmbers() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes, speeds, phases, types } = useMemo(() => {
    const pos = new Float32Array(EMBER_COUNT * 3);
    const sz = new Float32Array(EMBER_COUNT);
    const sp = new Float32Array(EMBER_COUNT);
    const ph = new Float32Array(EMBER_COUNT);
    const tp = new Float32Array(EMBER_COUNT);

    for (let i = 0; i < EMBER_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 35;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = Math.sin(theta) * r - 10;
      sz[i] = 0.4 + Math.random() * 2.0;
      sp[i] = 0.12 + Math.random() * 0.4;
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
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={EMBER_COUNT} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} count={EMBER_COUNT} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} count={EMBER_COUNT} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} count={EMBER_COUNT} />
        <bufferAttribute attach="attributes-aType" args={[types, 1]} count={EMBER_COUNT} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={emberVS}
        fragmentShader={emberFS}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════════════════════
   VOLUMETRIC FOG — Ground-level Gotham haze
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

    float n1 = noise(uv * 6.0 + uTime * 0.1);
    float n2 = noise(uv * 12.0 - uTime * 0.08);
    float n3 = noise(uv * 3.0 + vec2(uTime * 0.06, 0.0));
    float fog = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2);

    float edgeFade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
    edgeFade *= smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);

    float dist = length(vWorldPos.xz) * 0.012;
    float distFade = 1.0 - clamp(dist, 0.0, 1.0);

    float alpha = fog * edgeFade * distFade * 0.3;

    // Dark blue-grey fog with subtle golden underhaze
    vec3 fogColor = vec3(0.04, 0.04, 0.08);
    fogColor += vec3(0.3, 0.24, 0.1) * n3 * 0.15;

    gl_FragColor = vec4(fogColor, alpha);
  }
`;

function VolumetricFog() {
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
   GOTHAM STREETS — Dark grid with amber street-lamps
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

    vec2 c5 = vUv * 8.0;
    vec2 g5 = abs(fract(c5) - 0.5);
    float majorLine = min(g5.x, g5.y);
    float majorGrid = 1.0 - smoothstep(0.0, 0.015, majorLine);

    float dist = smoothstep(50.0, 5.0, length(vWP.xz));
    float horizon = (1.0 - vUv.y) * 0.85;

    // Dim car headlights (amber/white)
    float carLight = smoothstep(0.015, 0.0, abs(fract(c5.y) - 0.5)) *
                     smoothstep(0.0, 0.02, abs(fract(c5.x + uTime * 0.12) - 0.5)) *
                     0.25;

    // Bat-signal pulse from above
    float dc = length(vWP.xz);
    float pulse = smoothstep(1.5, 0.0, abs(dc - mod(uTime * 4.0, 60.0))) * 0.15;

    float alpha = (grid * 0.025 + majorGrid * 0.08 + carLight + pulse) * dist * horizon;

    // Dark street with amber lamp glow
    vec3 baseCol = vec3(0.06, 0.06, 0.12);
    vec3 goldGlow = vec3(0.83, 0.66, 0.33);
    vec3 col = baseCol + goldGlow * pulse * 0.4;
    col += vec3(0.85, 0.75, 0.45) * carLight;

    gl_FragColor = vec4(col, alpha);
  }
`;

function GothamStreets() {
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
   LIGHTNING FLASHES — Random ambient thunder illumination
   ══════════════════════════════════════════════════════════════ */

function LightningFlash() {
  const lightRef = useRef<THREE.PointLight>(null!);
  const nextFlash = useRef(3 + Math.random() * 8);

  useFrame((s) => {
    if (!lightRef.current) return;
    const t = s.clock.elapsedTime;

    if (t > nextFlash.current) {
      // Quick double-flash
      const dt = t - nextFlash.current;
      if (dt < 0.08) {
        lightRef.current.intensity = 3.0;
      } else if (dt < 0.12) {
        lightRef.current.intensity = 0.0;
      } else if (dt < 0.18) {
        lightRef.current.intensity = 1.5;
      } else if (dt < 0.25) {
        lightRef.current.intensity = 0.0;
        nextFlash.current = t + 4 + Math.random() * 10;
      }
    } else {
      lightRef.current.intensity = 0;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[15, 20, -20]}
      color="#C0C8E8"
      intensity={0}
      distance={100}
      decay={2}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   SEARCHLIGHT BEAMS — Sweeping light cones in the distance
   ══════════════════════════════════════════════════════════════ */

const beamVS = `
  varying float vProgress;
  void main() {
    vProgress = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFS = `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vProgress;

  void main() {
    float t = fract(uTime * 0.2);

    float beam = smoothstep(0.0, 0.08, vProgress - t + 0.1) *
                 smoothstep(0.2, 0.08, vProgress - t);
    float glow = exp(-abs(vProgress - t) * 10.0) * 0.25;
    float baseLine = 0.04;

    float alpha = (beam * 0.6 + glow + baseLine) * 0.5;
    alpha *= smoothstep(0.0, 0.05, vProgress) * smoothstep(1.0, 0.95, vProgress);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function SearchlightBeam({
  points,
  color = BAT_GOLD,
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
      <tubeGeometry args={[curve, 64, 0.015, 4, false]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={beamVS}
        fragmentShader={beamFS}
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
   PARALLAX CAMERA — Smooth dark atmospheric tracking
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
    const t = s.clock.elapsedTime;
    // Slow, dramatic breathing sway
    const targetX = mouse.current.x * 1.2 + Math.sin(t * 0.1) * 0.4;
    const targetY = -mouse.current.y * 0.6 + Math.cos(t * 0.08) * 0.25 + 2;

    camera.position.x += (targetX - camera.position.x) * 0.012;
    camera.position.y += (targetY - camera.position.y) * 0.012;
    camera.lookAt(0, -2, -10);
  });

  return null;
}

/* ══════════════════════════════════════════════════════════════
   MAIN SCENE — Gotham City Composition
   ══════════════════════════════════════════════════════════════ */

function Scene() {
  const searchlights = useMemo(
    () => [
      {
        pts: [[-25, 10, -18], [-15, 5, -10], [-5, 8, -6], [5, 3, -8]] as [number, number, number][],
        c: "#C8B56A",
        s: 0.5,
      },
      {
        pts: [[25, 8, -18], [15, 3, -10], [5, 6, -6], [-5, 1, -8]] as [number, number, number][],
        c: "#A89050",
        s: 0.7,
      },
      {
        pts: [[-20, -2, -22], [-10, 6, -14], [0, 10, -10], [10, 5, -12]] as [number, number, number][],
        c: "#D4A853",
        s: 0.4,
      },
    ],
    []
  );

  return (
    <>
      <ParallaxCamera />

      {/* Bat Signal — central searchlight beam */}
      <BatSignal />

      {/* Gothic cityscape — instanced dark towers */}
      <GothicSkyline />

      {/* Searchlight beams sweeping across Gotham */}
      {searchlights.map((t, i) => (
        <SearchlightBeam key={i} points={t.pts} color={t.c} speed={t.s} />
      ))}

      {/* Rain */}
      <RainParticles />

      {/* Atmospheric embers */}
      <AtmosphericEmbers />

      {/* Volumetric fog floor */}
      <VolumetricFog />

      {/* Gotham streets */}
      <GothamStreets />

      {/* Lightning */}
      <LightningFlash />

      {/* Lighting — Batman themed: dark with gold accents */}
      <ambientLight intensity={0.02} color="#0A1225" />
      <pointLight position={[0, 12, 5]} intensity={0.5} color={BAT_GOLD} distance={45} decay={2} />
      <pointLight position={[-15, 5, -8]} intensity={0.2} color={STEEL_GREY} distance={50} decay={2} />
      <pointLight position={[15, -3, -8]} intensity={0.15} color="#4A5568" distance={35} decay={2} />
      <pointLight position={[0, -10, -5]} intensity={0.1} color={NIGHT_BLUE} distance={30} decay={2} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXPORT — Gotham City Batman Background
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

      {/* CSS Bloom / Glow layer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          mixBlendMode: "screen",
          filter: "blur(10px) brightness(0.25)",
          opacity: 0.35,
          background: "transparent",
        }}
      />

      {/* Dark vignette — dramatic Batman framing */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(5,5,13,0.8) 100%)",
        }}
      />

      {/* Gold accent tint in corners */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          background:
            "linear-gradient(135deg, rgba(212,168,83,0.12) 0%, transparent 20%, transparent 80%, rgba(45,55,72,0.08) 100%)",
        }}
      />
    </div>
  );
}
