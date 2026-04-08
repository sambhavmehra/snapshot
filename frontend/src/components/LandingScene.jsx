import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Stars, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function LandingScene({ progress = 0, pointer = { x: 0, y: 0 } }) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }} dpr={[1, 1.8]}>
        <color attach="background" args={['#07101d']} />
        <fog attach="fog" args={['#07101d', 10, 28]} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 5, 8]} intensity={2.1} color="#a5f3fc" />
        <directionalLight position={[-6, -3, 4]} intensity={1.35} color="#2563eb" />
        <pointLight position={[0, 0, 5]} intensity={1.1} color="#ffffff" />
        <Stars radius={90} depth={42} count={1600} factor={4.6} saturation={0} fade speed={0.7} />
        <SceneCore progress={progress} pointer={pointer} />
      </Canvas>
    </div>
  );
}

function SceneCore({ progress, pointer }) {
  const worldRef = useRef(null);
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const cardsRef = useRef([]);
  const nodes = useMemo(
    () =>
      new Array(10).fill(null).map((_, index) => ({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 5.5,
          (Math.random() - 0.5) * 4,
        ],
        speed: 0.25 + Math.random() * 0.35,
        scale: 0.08 + Math.random() * 0.12,
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
      coreRef.current.rotation.y = t * 0.45 + progress * 1.4;
      coreRef.current.rotation.x = Math.sin(t * 0.65) * 0.12;
      coreRef.current.position.x = pointer.x * 0.35;
      coreRef.current.position.y = 0.35 + Math.sin(t * 1.2) * 0.14 + progress * 0.32;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.55;
      ringRef.current.rotation.x = Math.sin(t * 0.4) * 0.16 + progress * 0.35;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 1.3) * 0.04);
    }

    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      const offset = index * 0.8;
      card.rotation.y = Math.sin(t * 0.55 + offset) * 0.16 + pointer.x * 0.12;
      card.rotation.x = Math.cos(t * 0.42 + offset) * 0.08;
      card.position.y += (Math.sin(t * 0.8 + offset) * 0.02);
    });
  });

  return (
    <group ref={worldRef}>
      <mesh position={[0, -2.6, -4.8]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[28, 20]} />
        <meshStandardMaterial color="#08111d" emissive="#0d1930" emissiveIntensity={0.45} roughness={0.95} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>

      <group ref={coreRef}>
        <Trail width={1.4} length={5} color="#67e8f9" attenuation={(t) => t * t}>
          <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[0, 0, 0]}>
              <octahedronGeometry args={[1.1, 0]} />
              <meshStandardMaterial color="#eff6ff" emissive="#38bdf8" emissiveIntensity={0.85} roughness={0.12} metalness={0.72} />
            </mesh>
          </Float>
        </Trail>

        <mesh ref={ringRef} position={[0, 0, 0]}>
          <torusGeometry args={[2.25, 0.08, 24, 160]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.8} roughness={0.08} metalness={0.85} />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.82, 120]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

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
        accent="#60a5fa"
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

      <ConnectionBeam start={[-2.05, 1.1, 0]} end={[-0.45, 0.55, 0]} />
      <ConnectionBeam start={[2.05, 0.85, 0]} end={[0.65, 0.45, 0]} />
      <ConnectionBeam start={[0.1, -0.72, 0.2]} end={[0.05, -1.0, 0.72]} />

      {nodes.map((node, index) => (
        <KnowledgeNode key={index} {...node} />
      ))}

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

  useFrame(() => {
    const chapterShift = progress * 2.2;
    const targetX = pointer.x * 0.8;
    const targetY = 0.15 + pointer.y * 0.45 + progress * 0.28;
    const targetZ = 10 - chapterShift;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.lookAt(0, progress * -0.25, 0);
  });

  return null;
}

function StudyCard({ refSetter, position, rotation, title, accent, lines, large = false }) {
  return (
    <group ref={refSetter} position={position} rotation={rotation}>
      <RoundedBox args={[large ? 3.2 : 2.55, large ? 2.25 : 1.95, 0.14]} radius={0.16} smoothness={4}>
        <meshStandardMaterial color="#0f1f36" emissive="#123b73" emissiveIntensity={0.4} roughness={0.2} metalness={0.72} />
      </RoundedBox>
      <mesh position={[0, (large ? 0.64 : 0.5), 0.08]}>
        <planeGeometry args={[large ? 2.45 : 1.95, 0.18]} />
        <meshBasicMaterial color={accent} transparent opacity={0.92} />
      </mesh>
      {lines.map((width, index) => (
        <mesh key={index} position={[-0.25 + index * 0.08, 0.18 - index * 0.35, 0.08]}>
          <planeGeometry args={[width, 0.11]} />
          <meshBasicMaterial color={index === 0 ? '#eff6ff' : '#93c5fd'} transparent opacity={0.8 - index * 0.1} />
        </mesh>
      ))}
      <Text position={[-0.78, large ? 0.78 : 0.62, 0.09]} fontSize={0.18} color="#f8fafc" anchorX="left" anchorY="middle">
        {title}
      </Text>
    </group>
  );
}

function ConnectionBeam({ start, end }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.018, 8, false]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
    </mesh>
  );
}

function KnowledgeNode({ position, speed, scale }) {
  const ref = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (!ref.current) return;
    ref.current.position.x = position[0] + Math.cos(t * 1.2) * 0.22;
    ref.current.position.y = position[1] + Math.sin(t * 1.7) * 0.26;
    ref.current.position.z = position[2] + Math.sin(t) * 0.18;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#67e8f9" transparent opacity={0.92} />
    </mesh>
  );
}
