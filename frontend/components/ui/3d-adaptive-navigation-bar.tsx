import React, { useState, useRef, useEffect } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'

interface NavItem {
  label: string
  id: string
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion
 */
export const PillBase: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home')
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevSectionRef = useRef('home')
  
  const navItems: NavItem[] = [
    { label: 'Home', id: 'home' },
    { label: 'Problem', id: 'problem' },
    { label: 'Solution', id: 'solution' },
    { label: 'Features', id: 'features' },
    { label: 'Map', id: 'map' },
    { label: 'About', id: 'about' },
  ]

  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 })
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 })

  // Scroll detection to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => {
        const element = document.getElementById(item.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          return { id: item.id, top: rect.top, bottom: rect.bottom }
        }
        return null
      }).filter(Boolean) as Array<{ id: string; top: number; bottom: number }>

      const currentSection = sections.find(
        section => section.top <= 100 && section.bottom >= 100
      ) || sections[0]

      if (currentSection && currentSection.id !== activeSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection, navItems])

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true)
      pillWidth.set(580)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
        pillWidth.set(140)
      }, 600)
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [hovering, pillWidth])

  const handleMouseEnter = () => {
    setHovering(true)
  }

  const handleMouseLeave = () => {
    setHovering(false)
  }

  const handleSectionClick = (sectionId: string) => {
    setIsTransitioning(true)
    prevSectionRef.current = sectionId
    setActiveSection(sectionId)
    
    // Scroll to section
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    setHovering(false)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const activeItem = navItems.find(item => item.id === activeSection)

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full"
      style={{
        width: pillWidth,
        height: '56px',
        background: `
          linear-gradient(135deg, 
            #0a0a0a 0%, 
            #1a1a1a 15%, 
            #0f0f0f 30%, 
            #151515 45%, 
            #1a1a1a 60%, 
            #0f0f0f 75%, 
            #151515 90%, 
            #1a1a1a 100%
          )
        `,
        boxShadow: expanded
          ? `
            0 2px 4px rgba(0, 255, 255, 0.1),
            0 6px 12px rgba(0, 255, 255, 0.15),
            0 12px 24px rgba(0, 255, 255, 0.2),
            inset 0 2px 2px rgba(0, 255, 255, 0.1),
            inset 0 -3px 8px rgba(0, 0, 0, 0.5)
          `
          : `
            0 3px 6px rgba(0, 255, 255, 0.2),
            0 8px 16px rgba(0, 255, 255, 0.15),
            inset 0 2px 1px rgba(0, 255, 255, 0.1),
            inset 0 -2px 6px rgba(0, 0, 0, 0.3)
          `,
        x: pillShift,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out',
        border: '1px solid rgba(0, 255, 255, 0.2)',
      }}
    >
      <div 
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, rgba(0, 255, 255, 0) 0%, rgba(0, 255, 255, 0.8) 50%, rgba(0, 255, 255, 0) 100%)',
          filter: 'blur(0.5px)',
        }}
      />
      
      <div 
        ref={containerRef}
        className="relative z-10 h-full flex items-center justify-center px-6"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {!expanded && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 680,
                    color: '#00ffff',
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)',
                  }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {expanded && (
          <div className="flex items-center justify-evenly w-full">
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleSectionClick(item.id)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    fontSize: isActive ? '15.5px' : '15px',
                    fontWeight: isActive ? 680 : 510,
                    color: isActive ? '#00ffff' : '#888888',
                    textDecoration: 'none',
                    letterSpacing: '0.45px',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                    textShadow: isActive 
                      ? '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#00cccc'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#888888'
                    }
                  }}
                >
                  {item.label}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </motion.nav>
  )
}

