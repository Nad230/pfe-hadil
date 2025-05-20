// components/academic/FloatingCanvas.tsx
"use client"

import { Canvas } from "@react-three/fiber"
import { Float, Text3D, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

function FloatingText() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Text3D
        font="/fonts/inter_bold.json"
        size={0.5}
        height={0.2}
        curveSegments={12}
      >
        Academic Journey
        <meshStandardMaterial
          color="#4F46E5"
          emissive="#4F46E5"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Text3D>
    </Float>
  )
}

export default function FloatingCanvas() {
  return (
    <div className="h-[300px] -mt-6 mb-12">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Environment preset="city" />
        <FloatingText />
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
