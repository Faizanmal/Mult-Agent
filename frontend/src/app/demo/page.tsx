/**
 * Interactive Demo Component
 * Live demonstration of all animations and effects
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/animated-card';
import { FloatingParticles, GridBackground } from '@/components/ui/background-effects';
import { ModernButton, GradientButton } from '@/components/ui/modern-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { 
  fadeInUp, 
  scaleIn, 
  slideInFromBottom, 
  rotateIn,
  pulseAnimation,
  bounceAnimation 
} from '@/lib/animations';

export default function InteractiveDemo() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedAnimation, setSelectedAnimation] = useState('fadeInUp');

  const animations = {
    fadeInUp: { name: 'Fade In Up', variant: fadeInUp },
    scaleIn: { name: 'Scale In', variant: scaleIn },
    slideInFromBottom: { name: 'Slide In', variant: slideInFromBottom },
    rotateIn: { name: 'Rotate In', variant: rotateIn },
    pulse: { name: 'Pulse', variant: pulseAnimation },
    bounce: { name: 'Bounce', variant: bounceAnimation }
  };

  const [key, setKey] = useState(0);

  const resetAnimation = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl font-bold text-gradient">Interactive Demo</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See animations in action
          </p>
        </motion.div>

        {/* Controls */}
        <GlassCard blur="lg" gradient>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Animation Controls</h3>
              <div className="flex gap-2">
                <ModernButton
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                  icon={isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {isAnimating ? 'Pause' : 'Play'}
                </ModernButton>
                <ModernButton
                  size="sm"
                  variant="secondary"
                  onClick={resetAnimation}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </ModernButton>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.entries(animations).map(([key, anim]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedAnimation(key);
                    resetAnimation();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedAnimation === key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {anim.name}
                </motion.button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Demo Area */}
        <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <GridBackground />
          <FloatingParticles count={20} />

          <div className="relative z-10 h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {isAnimating && (
                <motion.div
                  key={key}
                  variants={animations[selectedAnimation as keyof typeof animations].variant}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="max-w-md"
                >
                  <GlassCard blur="xl" gradient>
                    <div className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">✨</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {animations[selectedAnimation as keyof typeof animations].name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        This demonstrates the animation effect. Watch how smoothly it animates!
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tabs Demo */}
        <Tabs defaultValue="effects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
          </TabsList>

          <TabsContent value="effects" className="space-y-4">
            <GlassCard>
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Visual Effects</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, rotateZ: 2 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/20"
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Hover Scale</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hover over this card</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ 
                      boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
                      scale: 1.02
                    }}
                    className="p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-2 border-pink-500/20"
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Glow Effect</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hover to see glow</p>
                  </motion.div>

                  <motion.div
                    animate={{ 
                      rotateY: [0, 180, 360],
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/20"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">3D Rotation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Continuous rotation</p>
                  </motion.div>

                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-red-500/10 border-2 border-yellow-500/20"
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Float Animation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Floating motion</p>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <GlassCard>
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Elements</h3>
                
                <div className="flex flex-wrap gap-4">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer"
                  >
                    <GradientButton>Click Me</GradientButton>
                  </motion.div>

                  <motion.div
                    drag
                    dragConstraints={{ left: 0, right: 200, top: 0, bottom: 0 }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold cursor-move"
                  >
                    Drag Me
                  </motion.div>

                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 text-white font-semibold cursor-pointer"
                  >
                    Spin Me
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="layouts" className="space-y-4">
            <GlassCard>
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Layout Animations</h3>
                
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="aspect-square rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold"
                    >
                      {i}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-600 dark:text-gray-400"
        >
          <p>Explore more components in the showcase page!</p>
        </motion.div>
      </div>
    </div>
  );
}
