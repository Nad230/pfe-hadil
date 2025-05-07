"use client"

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MascotMood } from '@/lib/stores/mascot-store'
import * as THREE from 'three'

interface MascotCharacterProps {
  mood: MascotMood
}

export function MascotCharacter({ mood }: MascotCharacterProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/robot.glb')
  const mixer = useRef<THREE.AnimationMixer>()

  useEffect(() => {
    if (!group.current) return
    
    // Clone the scene to avoid mutations
    const clonedScene = scene.clone()
    group.current.add(clonedScene)

    // Create animation mixer
    mixer.current = new THREE.AnimationMixer(clonedScene)

    // Clean up
    return () => {
      mixer.current?.stopAllAction()
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
  }, [scene])

  // Handle mood animations
  useEffect(() => {
    if (!mixer.current || !animations.length) return

    const clipMap = {
      idle: animations.find(a => a.name === 'Idle'),
      happy: animations.find(a => a.name === 'Wave'),
      error: animations.find(a => a.name === 'Fall'),
      teaching: animations.find(a => a.name === 'Point'),
      sleeping: animations.find(a => a.name === 'Sleep'),
      celebrating: animations.find(a => a.name === 'Dance'),
    }

    const clip = clipMap[mood]
    if (!clip) return

    // Stop all current animations
    mixer.current.stopAllAction()

    // Play new animation
    const action = mixer.current.clipAction(clip)
    action.reset().play()

    return () => {
      action.stop()
    }
  }, [mood, animations])

  // Animate on each frame
  useFrame((state, delta) => {
    mixer.current?.update(delta)
    
    if (group.current) {
      // Add some subtle floating motion
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
      
      // Add mood-specific animations
      switch (mood) {
        case 'celebrating':
          group.current.rotation.y += delta * 2
          break
        case 'error':
          group.current.position.x = Math.sin(state.clock.elapsedTime * 10) * 0.1
          break
        default:
          group.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
      }
    }
  })

  return <group ref={group} />
}