import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls, Grid } from '@react-three/drei';
import DroneAssembly from './DroneAssembly';
import { SimulationState, SimulationParams } from '../types';

interface DroneSceneProps {
  simState: SimulationState;
  params: SimulationParams;
  onImpact: () => void;
  onResetComplete: () => void;
}

const DroneScene: React.FC<DroneSceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 2.5, 6], fov: 45 }}>
        <color attach="background" args={['#1e293b']} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="cyan" />

        {/* Environment Reflection for NiTi */}
        <Environment preset="city" />

        {/* The Simulation Subject */}
        <DroneAssembly {...props} />

        {/* Floor and Context */}
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellColor="#334155"
          sectionColor="#475569"
          fadeDistance={15}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.5} />
        </mesh>

        <ContactShadows
          opacity={0.7}
          scale={10}
          blur={2.5}
          far={4}
          resolution={256}
          color="#000000"
        />

        {/* Controls */}
        <OrbitControls
          target={[0, 1, 0]}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
};

export default DroneScene;