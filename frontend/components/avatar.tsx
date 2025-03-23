"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { Howl } from "howler";
import styles from "./avatar.module.css";

function AvatarModel({ audioUrl }: { audioUrl: string }) {
  const { scene, animations } = useGLTF("/models/avatar.glb");
  const { actions } = useAnimations(animations, scene);
  const soundRef = useRef<Howl | null>(null);

  // Map phonemes to animation names
  const phonemeToAnimation = {
    A: "Mouth_A", // Replace with your model's animation names
    E: "Mouth_E",
    I: "Mouth_I",
    O: "Mouth_O",
    U: "Mouth_U",
  };

  // Play lip-sync animations based on audio
  useEffect(() => {
    if (!audioUrl) return;

    // Load the audio file
    soundRef.current = new Howl({
      src: [audioUrl],
      onplay: () => {
        // Start lip-sync animations
        const phonemes = ["A", "E", "I", "O", "U"]; // Example phonemes
        let currentPhonemeIndex = 0;

        const playNextPhoneme = () => {
          const phoneme = phonemes[currentPhonemeIndex] as keyof typeof phonemeToAnimation;
          const animationName = phonemeToAnimation[phoneme];

          if (actions[animationName]) {
            const action = actions[animationName];
            action.reset().fadeIn(0.1).play();
            setTimeout(() => action?.fadeOut(0.1), 200); // Stop after 200ms
          }

          currentPhonemeIndex = (currentPhonemeIndex + 1) % phonemes.length;
        };

        const interval = setInterval(playNextPhoneme, 300); // Adjust timing based on audio
        return () => clearInterval(interval);
      },
    });

    if (soundRef.current) {
      soundRef.current.play();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, [audioUrl, actions]);

  return <primitive object={scene} scale={1} position={[0, -1.5, 0]} />;
}

export default function Avatar() {
  const audioUrl = "/audio/sample.mp3"; // Replace with your audio file

  return (
    <div className={styles.avatarWrapper}>
      <div className={styles.avatarContainer}>
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 1.5, 5], fov: 45 }}
        >
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <AvatarModel audioUrl={audioUrl} />
          <OrbitControls enableZoom={true} enablePan={true} />
        </Canvas>
      </div>
    </div>
  );
}