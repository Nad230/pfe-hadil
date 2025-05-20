"use client"

import { Canvas } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion-3d'
import { Environment, Float, Text3D, useTexture, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

export function BackgroundScene() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      
      <Environment preset="city" />
      
      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={2}
      >
        <Text3D
          font="/fonts/inter_bold.json"
          size={0.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {`Academic\nDashboard`}
          <meshStandardMaterial
            color={isDark ? "#ffffff" : "#000000"}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Float>

      <Particles count={2000} dark={isDark} />

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration offset={[0.002, 0.002]} />
      </EffectComposer>
    </Canvas>
  )
}
function Particles({ count, dark }: { count: number; dark: boolean }) {
    const mesh = useRef<THREE.Points>(null!)
    const [positions] = useState(() => {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 10
        pos[i * 3 + 1] = (Math.random() - 0.5) * 10
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      }
      return pos
    })
  
    return (
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={dark ? '#ffffff' : '#000000'}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    )
  }
  