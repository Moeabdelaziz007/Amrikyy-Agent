import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from './button'
import { Card } from './card'
import {
  containerVariants,
  itemVariants,
  floatingVariants,
  cardHoverVariants
} from '@/lib/animations'

interface AnimatedHeroProps {
  title: string
  subtitle: string
  primaryAction?: {
    text: string
    onClick: () => void
  }
  secondaryAction?: {
    text: string
    onClick: () => void
  }
  features?: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
}

export function AnimatedHero({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  features = []
}: AnimatedHeroProps) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-maya-ocean/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero title with staggered animation */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-maya-ocean bg-clip-text text-transparent leading-tight"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            {primaryAction && (
              <Button
                size="lg"
                onClick={primaryAction.onClick}
                className="px-8 py-4 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                {primaryAction.text}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size="lg"
                variant="outline"
                onClick={secondaryAction.onClick}
                className="px-8 py-4 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                {secondaryAction.text}
              </Button>
            )}
          </motion.div>

          {/* Features grid */}
          {features.length > 0 && (
            <motion.div
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial="rest"
                  animate="rest"
                >
                  <Card
                    className="p-6 text-center cursor-pointer group"
                    variants={cardHoverVariants}
                  >
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-muted-foreground rounded-full mt-2"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}

export default AnimatedHero