import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState, SimulationParams } from '../types';

interface DroneAssemblyProps {
  simState: SimulationState;
  params: SimulationParams;
  onImpact: () => void;
  onResetComplete: () => void;
}

const DroneAssembly: React.FC<DroneAssemblyProps> = ({ simState, params, onImpact, onResetComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const armPivotRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Group>(null);
  const nitiMeshRef = useRef<THREE.Mesh>(null);

  // Simulation variables
  const velocity = useRef(0);
  const positionY = useRef(params.dropHeight); // Start height
  const bendAngle = useRef(0);
  const tiltAngle = useRef(0); // Track body tilt
  const resetTime = useRef(0);

  // Constants
  const GRAVITY = 9.81;
  const MAX_BEND = Math.PI / 3; // 60 degrees strict limit
  const TARGET_TILT = -Math.PI / 8; // -22.5 degrees tilt during fall

  // World Scaling: 1 Three.js unit = 100mm
  const SCALE = 1 / 100;

  // Derived dimensions in local units
  const NITI_FIXED_LENGTH = 40; // Hardcoded optimal parameter
  const nitiUnitLen = NITI_FIXED_LENGTH * SCALE;
  const totalUnitLen = params.armLength * SCALE;
  const cfUnitLen = totalUnitLen - nitiUnitLen;
  const radiusUnit = params.armRadius * SCALE;

  // Update initial position when params change (only when IDLE)
  useEffect(() => {
    if (simState === SimulationState.IDLE) {
      positionY.current = params.dropHeight;
      tiltAngle.current = 0;
      bendAngle.current = 0;
      velocity.current = 0;

      if (groupRef.current) {
        groupRef.current.position.y = params.dropHeight;
        groupRef.current.rotation.z = 0;
      }
      if (armPivotRef.current) {
        armPivotRef.current.rotation.z = 0;
      }
    }
  }, [params.dropHeight, simState]);

  useFrame((state, delta) => {
    if (!groupRef.current || !armPivotRef.current || !propRef.current || !nitiMeshRef.current) return;

    // Approximate arm length from pivot to prop tip (Geometry: Total Length + Motor/Prop offset)
    const armRadius = totalUnitLen + (0.15 * (150 * SCALE)); // slightly adjustable offset

    // 1. Propeller Spin (Always active)
    propRef.current.rotation.y += delta * 20;

    // 2. Falling Logic
    if (simState === SimulationState.DROPPING) {
      velocity.current += GRAVITY * delta;
      positionY.current -= velocity.current * delta;

      // Apply tilt to make arm land first
      tiltAngle.current = THREE.MathUtils.lerp(tiltAngle.current, TARGET_TILT, delta * 3);
      groupRef.current.rotation.z = tiltAngle.current;

      // Dynamic Impact Detection
      // Calculate where the tip is relative to the floor
      // tipOffset is negative when tilted down
      const tipOffset = armRadius * Math.sin(tiltAngle.current);
      const currentTipY = positionY.current + tipOffset;
      const FLOOR_Y = 0.05; // Slightly above zero to avoid z-fighting with grid

      if (currentTipY <= FLOOR_Y) {
        // Impact detected: Snap to floor
        positionY.current = FLOOR_Y - tipOffset;
        velocity.current = 0;
        onImpact();
      }

      groupRef.current.position.y = positionY.current;
    }

    // 3. Impact Bending Logic (Instantaneous high energy absorption)
    if (simState === SimulationState.IMPACT) {
      // Animate bending quickly using lerp
      // The arm bends UP (+Z) relative to the body (which is tilted down)
      const targetBend = MAX_BEND;
      bendAngle.current = THREE.MathUtils.lerp(bendAngle.current, targetBend, delta * 15);

      armPivotRef.current.rotation.z = bendAngle.current;

      // Ensure body stays locked in tilted position on floor
      if (groupRef.current) {
        groupRef.current.rotation.z = tiltAngle.current;
      }
    }

    // 4. Resetting Logic (Heat applied)
    if (simState === SimulationState.RESETTING) {
      // Slow recovery (shape memory effect)
      resetTime.current += delta;

      // Recover bend
      const recoverySpeed = 1.0;
      bendAngle.current = THREE.MathUtils.lerp(bendAngle.current, 0, delta * recoverySpeed);
      armPivotRef.current.rotation.z = bendAngle.current;

      // Recover Tilt
      tiltAngle.current = THREE.MathUtils.lerp(tiltAngle.current, 0, delta * recoverySpeed);
      groupRef.current.rotation.z = tiltAngle.current;

      // Heat Effect
      const heatFactor = Math.min(1, Math.max(0, Math.sin(resetTime.current * 4)));
      (nitiMeshRef.current.material as THREE.MeshStandardMaterial).emissive.setHSL(0, 1, heatFactor * 0.8);
      (nitiMeshRef.current.material as THREE.MeshStandardMaterial).color.setHSL(0, 0, 0.7 - (heatFactor * 0.2));

      // Return to height
      if (bendAngle.current < 0.05 && Math.abs(tiltAngle.current) < 0.05) {
        // Move drone back up
        positionY.current = THREE.MathUtils.lerp(positionY.current, params.dropHeight, delta * 3);
        groupRef.current.position.y = positionY.current;

        // Check completion
        if (Math.abs(positionY.current - params.dropHeight) < 0.05) {
          resetTime.current = 0;
          onResetComplete();
          // Reset material
          (nitiMeshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
          (nitiMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xaaaaaa);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, params.dropHeight, 0]} scale={params.droneSize}>

      {/* --- Drone Body (White, High Quality) --- */}
      <Box args={[1.2, 0.4, 0.8]} position={[-0.6, 0, 0]}>
        <meshStandardMaterial color="#262626" roughness={0.7} metalness={0.3} />
      </Box>
      {/* Decorative body details */}
      <Box args={[1.0, 0.45, 0.6]} position={[-0.6, 0.05, 0]}>
        <meshStandardMaterial color="#171717" roughness={0.9} />
      </Box>

      {/* --- Pivot Group (Bends on Impact) --- */}
      {/* Pivot point is at (0,0,0) relative to group, which is the attachment point */}
      <group ref={armPivotRef}>

        {/* 1. NiTi Root (Silver Mirror) */}
        {/* Position: center is at length/2. Rotation -90 around Z puts it along X axis */}
        <Cylinder
          ref={nitiMeshRef}
          args={[radiusUnit, radiusUnit, nitiUnitLen, 32]}
          rotation={[0, 0, -Math.PI / 2]}
          position={[nitiUnitLen / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#aaaaaa"
            roughness={0.1}
            metalness={0.9}
          />
        </Cylinder>

        {/* 2. CF Arm Group (Moves to end of NiTi) */}
        <group position={[nitiUnitLen, 0, 0]}>
          {/* CF Cylinder (Matte Black) */}
          <Cylinder
            args={[radiusUnit * 0.9, radiusUnit * 0.8, cfUnitLen, 32]}
            rotation={[0, 0, -Math.PI / 2]}
            position={[cfUnitLen / 2, 0, 0]}
          >
            <meshStandardMaterial
              color="#111111"
              roughness={0.8}
              metalness={0.2}
            />
          </Cylinder>

          {/* 3. Motor Housing (At end of CF) */}
          <group position={[cfUnitLen, radiusUnit + 0.02, 0]}>
            <Cylinder args={[radiusUnit * 2, radiusUnit * 2, 0.25, 32]}>
              <meshStandardMaterial color="#333" />
            </Cylinder>

            {/* 4. Propeller Assembly */}
            <group ref={propRef} position={[0, 0.15, 0]}>
              {/* Hub */}
              <Cylinder args={[0.05, 0.05, 0.05, 16]}>
                <meshStandardMaterial color="#888" />
              </Cylinder>

              {/* Blade 1 */}
              <mesh position={[0.6, 0, 0]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[1.2, 0.02, 0.15]} />
                <meshStandardMaterial color="#000" transparent opacity={0.9} />
              </mesh>
              {/* Blade 2 */}
              <mesh position={[-0.6, 0, 0]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[1.2, 0.02, 0.15]} />
                <meshStandardMaterial color="#000" transparent opacity={0.9} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export default DroneAssembly;