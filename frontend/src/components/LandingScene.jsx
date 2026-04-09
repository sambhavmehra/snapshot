"use client";
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Stars, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function LandingScene({ progress = 0, pointer = { x: 0, y: 0 } }) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }} dpr={[1, 1.8]}>
        <color attach="background" args={['#07101d']} />
        <fog attach="fog" args={['#07101d', 12, 30]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 8]} intensity={2.4} color="#a5f3fc" />
        <directionalLight position={[-6, -3, 4]} intensity={1.5} color="#2563eb" />
        <pointLight position={[0, 2, 5]} intensity={1.4} color="#67e8f9" distance={12} />
        <pointLight position={[-3, -1, 3]} intensity={0.8} color="#818cf8" distance={10} />
        <Stars radius={100} depth={50} count={2200} factor={4.8} saturation={0.1} fade speed={0.5} />
        <SceneCore progress={progress} pointer={pointer} />
      </Canvas>
    </div>
  );
}

function SceneCore({ progress, pointer }) {
  const worldRef = useRef(null);
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);
  const cardsRef = useRef([]);

  const nodes = useMemo(
    () =>
      new Array(18).fill(null).map(() => ({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 5,
        ],
        speed: 0.2 + Math.random() * 0.4,
        scale: 0.04 + Math.random() * 0.1,
        color: ['#67e8f9', '#38bdf8', '#818cf8', '#a78bfa', '#7dd3fc'][Math.floor(Math.random() * 5)],
      })),
    []
  );

  const auroraNodes = useMemo(
    () =>
      new Array(6).fill(null).map((_, i) => ({
        position: [(i - 2.5) * 2.2, -3.5 + Math.random() * 0.6, -3 - Math.random() * 2],
        scale: [3 + Math.random() * 2, 0.3 + Math.random() * 0.4, 1],
        speed: 0.15 + Math.random() * 0.25,
        color: ['#38bdf8', '#818cf8', '#67e8f9', '#a78bfa', '#0ea5e9', '#6366f1'][i],
      })),
    []
  );

  useCameraRig(progress, pointer);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (worldRef.current) {
      worldRef.current.rotation.y = THREE.MathUtils.lerp(worldRef.current.rotation.y, pointer.x * 0.22 + progress * 0.18, 0.05);
      worldRef.current.rotation.x = THREE.MathUtils.lerp(worldRef.current.rotation.x, pointer.y * 0.1, 0.05);
      worldRef.current.position.y = THREE.MathUtils.lerp(worldRef.current.position.y, -progress * 0.9, 0.04);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.35 + progress * 1.4;
      coreRef.current.rotation.x = Math.sin(t * 0.55) * 0.14;
      coreRef.current.position.x = pointer.x * 0.35;
      coreRef.current.position.y = 0.35 + Math.sin(t * 1.0) * 0.18 + progress * 0.32;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.45;
      ringRef.current.rotation.x = Math.sin(t * 0.35) * 0.18 + progress * 0.35;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.05);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.3;
      ring2Ref.current.rotation.y = Math.cos(t * 0.4) * 0.2;
      ring2Ref.current.scale.setScalar(1 + Math.cos(t * 0.9) * 0.04);
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.2;
      ring3Ref.current.rotation.x = Math.sin(t * 0.25) * 0.3;
      ring3Ref.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.03);
    }

    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      const offset = index * 0.8;
      card.rotation.y = Math.sin(t * 0.55 + offset) * 0.16 + pointer.x * 0.12;
      card.rotation.x = Math.cos(t * 0.42 + offset) * 0.08;
      card.position.y += (Math.sin(t * 0.8 + offset) * 0.015);
    });
  });

  return (
    <group ref={worldRef}>
      {/* Ground plane */}
      <mesh position={[0, -2.6, -4.8]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[32, 24]} />
        <meshStandardMaterial color="#08111d" emissive="#0d1930" emissiveIntensity={0.45} roughness={0.95} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Aurora ribbons */}
      {auroraNodes.map((aurora, i) => (
        <AuroraRibbon key={`aurora-${i}`} {...aurora} />
      ))}

      {/* Central core */}
      <group ref={coreRef}>
        <Trail width={1.6} length={6} color="#67e8f9" attenuation={(t) => t * t}>
          <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
            <mesh position={[0, 0, 0]}>
              <octahedronGeometry args={[1.15, 0]} />
              <meshStandardMaterial
                color="#eff6ff"
                emissive="#38bdf8"
                emissiveIntensity={1.0}
                roughness={0.08}
                metalness={0.8}
              />
            </mesh>
          </Float>
        </Trail>

        {/* Inner glow sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.15} />
        </mesh>

        {/* Primary ring */}
        <mesh ref={ringRef} position={[0, 0, 0]}>
          <torusGeometry args={[2.25, 0.06, 24, 160]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.9} roughness={0.06} metalness={0.9} />
        </mesh>

        {/* Secondary ring - tilted */}
        <mesh ref={ring2Ref} position={[0, 0, 0]} rotation={[1.2, 0.5, 0]}>
          <torusGeometry args={[2.8, 0.035, 20, 120]} />
          <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={0.7} roughness={0.1} metalness={0.85} transparent opacity={0.7} />
        </mesh>

        {/* Third ring - perpendicular */}
        <mesh ref={ring3Ref} position={[0, 0, 0]} rotation={[Math.PI / 2, 0.3, 0]}>
          <torusGeometry args={[1.7, 0.025, 16, 100]} />
          <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.6} roughness={0.12} metalness={0.8} transparent opacity={0.5} />
        </mesh>

        {/* Flat disc */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.82, 120]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Floating study cards */}
      <StudyCard
        refSetter={(node) => (cardsRef.current[0] = node)}
        position={[-3.15, 1.8, -0.5]}
        rotation={[0.08, 0.32, -0.06]}
        title="Vision Scan"
        accent="#38bdf8"
        lines={[1.4, 1.9, 1.1]}
      />
      <StudyCard
        refSetter={(node) => (cardsRef.current[1] = node)}
        position={[3.25, 1.15, -0.2]}
        rotation={[-0.04, -0.32, 0.06]}
        title="AI Notes"
        accent="#818cf8"
        lines={[1.7, 1.2, 1.55]}
      />
      <StudyCard
        refSetter={(node) => (cardsRef.current[2] = node)}
        position={[0.2, -1.55, 1.1]}
        rotation={[0.06, 0.04, -0.02]}
        title="Tutor Chat"
        accent="#7dd3fc"
        lines={[1.8, 1.45, 1.25]}
        large
      />

      {/* Connection beams */}
      <ConnectionBeam start={[-2.05, 1.1, 0]} end={[-0.45, 0.55, 0]} color="#38bdf8" />
      <ConnectionBeam start={[2.05, 0.85, 0]} end={[0.65, 0.45, 0]} color="#818cf8" />
      <ConnectionBeam start={[0.1, -0.72, 0.2]} end={[0.05, -1.0, 0.72]} color="#7dd3fc" />

      {/* Knowledge particles */}
      {nodes.map((node, index) => (
        <KnowledgeNode key={index} {...node} />
      ))}

      {/* Bottom labels */}
      <Text position={[-3.55, -2.35, 0.4]} fontSize={0.3} color="#e0f2fe" anchorX="left" anchorY="middle">
        Scan
      </Text>
      <Text position={[0, -2.35, 0.4]} fontSize={0.3} color="#7dd3fc" anchorX="center" anchorY="middle">
        Understand
      </Text>
      <Text position={[3.55, -2.35, 0.4]} fontSize={0.3} color="#e0f2fe" anchorX="right" anchorY="middle">
        Learn
      </Text>
    </group>
  );
}

function useCameraRig(progress, pointer) {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const chapterShift = progress * 2.2;
    const breathe = Math.sin(t * 0.3) * 0.15;
    const targetX = pointer.x * 0.8 + Math.sin(t * 0.2) * 0.1;
    const targetY = 0.15 + pointer.y * 0.45 + progress * 0.28 + breathe;
    const targetZ = 10 - chapterShift;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.lookAt(0, progress * -0.25, 0);
  });

  return null;
}

function AuroraRibbon({ position, scale, speed, color }) {
  const ref = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.4;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.08;
    ref.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.04;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function StudyCard({ refSetter, position, rotation, title, accent, lines, large = false }) {
  return (
    <group ref={refSetter} position={position} rotation={rotation}>
      <RoundedBox args={[large ? 3.2 : 2.55, large ? 2.25 : 1.95, 0.14]} radius={0.16} smoothness={4}>
        <meshStandardMaterial color="#0f1f36" emissive="#123b73" emissiveIntensity={0.5} roughness={0.18} metalness={0.75} />
      </RoundedBox>
      {/* Card header accent bar */}
      <mesh position={[0, (large ? 0.64 : 0.5), 0.08]}>
        <planeGeometry args={[large ? 2.45 : 1.95, 0.18]} />
        <meshBasicMaterial color={accent} transparent opacity={0.92} />
      </mesh>
      {/* Content lines */}
      {lines.map((width, index) => (
        <mesh key={index} position={[-0.25 + index * 0.08, 0.18 - index * 0.35, 0.08]}>
          <planeGeometry args={[width, 0.11]} />
          <meshBasicMaterial color={index === 0 ? '#eff6ff' : '#93c5fd'} transparent opacity={0.8 - index * 0.1} />
        </mesh>
      ))}
      {/* Card title */}
      <Text position={[-0.78, large ? 0.78 : 0.62, 0.09]} fontSize={0.18} color="#f8fafc" anchorX="left" anchorY="middle">
        {title}
      </Text>
      {/* Subtle glow behind card */}
      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[large ? 3.6 : 2.9, large ? 2.6 : 2.3]} />
        <meshBasicMaterial color={accent} transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function ConnectionBeam({ start, end, color = '#38bdf8' }) {
  const ref = useRef(null);
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    ref.current.material.opacity = 0.4 + Math.sin(t * 2) * 0.2;
  });

  return (
    <mesh ref={ref}>
      <tubeGeometry args={[curve, 20, 0.02, 8, false]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function KnowledgeNode({ position, speed, scale, color = '#67e8f9' }) {
  const ref = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (!ref.current) return;
    ref.current.position.x = position[0] + Math.cos(t * 1.2) * 0.28;
    ref.current.position.y = position[1] + Math.sin(t * 1.7) * 0.32;
    ref.current.position.z = position[2] + Math.sin(t) * 0.22;
    ref.current.material.opacity = 0.6 + Math.sin(t * 3) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
}
