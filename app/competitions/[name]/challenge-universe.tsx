"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import {
  ChevronLeft,
  Terminal,
  Shield,
  Zap,
  Trophy,
  Flag,
  Code,
  FileText,
  Search,
  ZoomIn,
  ZoomOut,
  Compass,
} from "lucide-react"

const categoryColors = {
  web: { primary: "#3b82f6", secondary: "#1d4ed8" },
  crypto: { primary: "#10b981", secondary: "#047857" },
  forensics: { primary: "#f59e0b", secondary: "#b45309" },
  pwn: { primary: "#ef4444", secondary: "#b91c1c" },
  reverse: { primary: "#8b5cf6", secondary: "#6d28d9" },
  osint: { primary: "#f97316", secondary: "#c2410c" },
}

const difficultyProperties = {
  easy: { size: 1, speed: 1.5, glow: 0.5 },
  medium: { size: 1.2, speed: 1.2, glow: 0.7 },
  hard: { size: 1.4, speed: 1, glow: 0.9 },
  insane: { size: 1.6, speed: 0.8, glow: 1.1 },
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "web":
      return <Code style={{ width: "100%", height: "100%" }} />
    case "crypto":
      return <Shield style={{ width: "100%", height: "100%" }} />
    case "forensics":
      return <Zap style={{ width: "100%", height: "100%" }} />
    case "pwn":
      return <Terminal style={{ width: "100%", height: "100%" }} />
    case "reverse":
      return <FileText style={{ width: "100%", height: "100%" }} />
    case "osint":
      return <Search style={{ width: "100%", height: "100%" }} />
    default:
      return <Flag style={{ width: "100%", height: "100%" }} />
  }
}

const ChallengeNode = ({
  challenge,
  position,
  scale,
  onClick,
  isSelected,
  isVisible,
}: {
  challenge: any
  position: { x: number; y: number; z: number }
  scale: number
  onClick: () => void
  isSelected: boolean
  isVisible: boolean
}) => {
  const categoryColor = categoryColors[challenge.category as keyof typeof categoryColors] || categoryColors.web
  const diffProps = difficultyProperties[challenge.difficulty as keyof typeof difficultyProperties]

  const size = 50 * diffProps.size * scale

  const pulseSpeed = diffProps.speed
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2 / pulseSpeed,
        repeat: Number.POSITIVE_INFINITY,
        ease: [0.42, 0, 0.58, 1] as const,
      },
    },
  }

  const selectedVariants = {
    unselected: {
      boxShadow: `0 0 ${10 * diffProps.glow * scale}px ${categoryColor.primary}`,
      scale: 1,
    },
    selected: {
      boxShadow: `0 0 ${30 * diffProps.glow * scale}px ${categoryColor.primary}`,
      scale: 1.2,
      transition: { duration: 0.3 },
    },
  }

  const zIndex = Math.round(1000 - position.z)

  if (!isVisible) return null

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: challenge.solved ? categoryColor.primary : "rgba(20, 20, 20, 0.8)",
        border: `2px solid ${categoryColor.primary}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: `${12 * scale}px`,
        cursor: "pointer",
        zIndex,
        transformStyle: "preserve-3d",
        transform: `translateZ(${position.z}px)`,
        opacity: Math.min(1, Math.max(0.2, 1 - Math.abs(position.z) / 1000)),
      }}
      variants={selectedVariants}
      animate={isSelected ? "selected" : "unselected"}
      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
      onClick={onClick}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
        variants={pulseVariants}
        animate="pulse"
      >
        <div
          style={{
            width: `${size * 0.5}px`,
            height: `${size * 0.5}px`,
            color: challenge.solved ? "white" : categoryColor.primary,
          }}
        >
          {getCategoryIcon(challenge.category)}
        </div>
      </motion.div>

      <div
        style={{
          position: "absolute",
          bottom: `-${20 * scale}px`,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: categoryColor.primary,
          padding: `${2 * scale}px ${4 * scale}px`,
          borderRadius: `${10 * scale}px`,
          fontSize: `${10 * scale}px`,
          fontWeight: "bold",
          whiteSpace: "nowrap",
        }}
      >
        {challenge.points}
      </div>
    </motion.div>
  )
}

const ChallengeDetail = ({ challenge, onClose }: { challenge: any; onClose: () => void }) => {
  const categoryColor = categoryColors[challenge.category as keyof typeof categoryColors] || categoryColors.web

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "600px",
        backgroundColor: "rgba(10, 10, 10, 0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        padding: "20px",
        color: "white",
        boxShadow: `0 0 20px ${categoryColor.primary}`,
        border: `1px solid ${categoryColor.primary}`,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "15px",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: categoryColor.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {getCategoryIcon(challenge.category)}
        </div>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 5px 0",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            {challenge.name}
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              fontSize: "14px",
            }}
          >
            <span
              style={{
                backgroundColor: categoryColor.primary,
                color: "white",
                padding: "2px 8px",
                borderRadius: "10px",
                textTransform: "capitalize",
              }}
            >
              {challenge.category}
            </span>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "2px 8px",
                borderRadius: "10px",
                textTransform: "capitalize",
              }}
            >
              {challenge.difficulty}
            </span>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {challenge.points} pts
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: challenge.solved ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
            color: challenge.solved ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)",
            padding: "5px 10px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {challenge.solved ? "SOLVED" : "UNSOLVED"}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
          fontSize: "16px",
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: 0 }}>{challenge.description}</p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        {challenge.solved && (
          <button
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              color: "rgb(16, 185, 129)",
              border: "none",
              padding: "8px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            View Writeup
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Close
        </button>
      </div>
    </motion.div>
  )
}

const CategoryLegend = ({
  categories,
  onCategoryClick,
  activeCategory,
}: {
  categories: string[]
  onCategoryClick: (category: string | null) => void
  activeCategory: string | null
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        position: "absolute",
        left: "20px",
        top: "100px",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        padding: "15px",
        color: "white",
        zIndex: 1000,
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "16px",
          fontWeight: "bold",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "8px",
        }}
      >
        Categories
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          onClick={() => onCategoryClick(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 8px",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: activeCategory === null ? "rgba(255, 255, 255, 0.1)" : "transparent",
            transition: "background-color 0.2s",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Compass size={12} color="black" />
          </div>
          <span style={{ fontSize: "14px" }}>All</span>
        </div>

        {categories.map((category) => {
          const categoryColor = categoryColors[category as keyof typeof categoryColors] || categoryColors.web

          return (
            <div
              key={category}
              onClick={() => onCategoryClick(category)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: activeCategory === category ? "rgba(255, 255, 255, 0.1)" : "transparent",
                transition: "background-color 0.2s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: categoryColor.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getCategoryIcon(category)}
              </div>
              <span style={{ fontSize: "14px", textTransform: "capitalize" }}>{category}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

const CompetitionInfo = ({ competition }: { competition: any }) => {
  const progressPercentage = Math.round((competition.earnedPoints / competition.totalPoints) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        position: "absolute",
        right: "20px",
        top: "100px",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        padding: "15px",
        color: "white",
        zIndex: 1000,
        maxWidth: "300px",
      }}
    >
      <h2
        style={{
          margin: "0 0 5px 0",
          fontSize: "20px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Trophy size={20} color="#f59e0b" />
        {competition.name}
      </h2>

      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px",
            fontSize: "14px",
          }}
        >
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>

        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercentage}%`,
              background: "linear-gradient(90deg, #10b981, #3b82f6)",
              borderRadius: "4px",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "5px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <span>{competition.earnedPoints} pts earned</span>
          <span>{competition.totalPoints} pts total</span>
        </div>
      </div>

      <Link
        href="/competitions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          marginTop: "15px",
          color: "#3b82f6",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        <ChevronLeft size={16} />
        Back to Competitions
      </Link>
    </motion.div>
  )
}

const Controls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  zoomLevel,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  zoomLevel: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        position: "absolute",
        left: "20px",
        bottom: "20px",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        padding: "10px",
        color: "white",
        zIndex: 1000,
        display: "flex",
        gap: "10px",
      }}
    >
      <button
        onClick={onZoomIn}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
        }}
      >
        <ZoomIn size={20} />
      </button>

      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          padding: "0 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        {Math.round(zoomLevel * 100)}%
      </div>

      <button
        onClick={onZoomOut}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
        }}
      >
        <ZoomOut size={20} />
      </button>

      <button
        onClick={onReset}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "none",
          padding: "0 15px",
          height: "40px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          fontSize: "14px",
        }}
      >
        Reset View
      </button>
    </motion.div>
  )
}

const DirectionIndicator = ({
  position,
  containerRef,
  pan,
  scale,
}: {
  position: { x: number; y: number }
  containerRef: React.RefObject<HTMLDivElement | null>
  pan: { x: number; y: number }
  scale: number
}) => {
  const [indicator, setIndicator] = useState({ visible: false, angle: 0, x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const screenX = (position.x - pan.x) * scale + centerX
    const screenY = (position.y - pan.y) * scale + centerY

    const margin = Math.min(rect.width, rect.height) * 0.15 // 15% of viewport
    const isOutside = screenX < margin || screenX > rect.width - margin ||
                     screenY < margin || screenY > rect.height - margin

    if (isOutside) {
      const dx = screenX - centerX
      const dy = screenY - centerY
      const angle = Math.atan2(dy, dx)

      const radius = Math.min(rect.width, rect.height) / 2 - 60
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      setIndicator({
        visible: true,
        angle: (angle * 180) / Math.PI,
        x,
        y,
      })
    } else {
      setIndicator({ ...indicator, visible: false })
    }
  }, [position, pan, scale, containerRef])

  if (!indicator.visible) return null

  const distance = Math.round(
    Math.sqrt(
      Math.pow((position.x - (-pan.x)) / scale, 2) +
      Math.pow((position.y - (-pan.y)) / scale, 2)
    )
  )

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${indicator.x}px`,
        top: `${indicator.y}px`,
        transform: `translate(-50%, -50%) rotate(${indicator.angle}deg)`,
        color: "white",
        zIndex: 1000,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      initial={false}
      animate={{
        scale: isHovered ? 1.2 : 1,
      }}
      whileHover={{ scale: 1.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderTop: "2px solid white",
            borderRight: "2px solid white",
            transform: "rotate(45deg)",
          }}
        />
      </div>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            transform: "rotate(-${indicator.angle}deg)",
            left: "100%",
            marginLeft: "8px",
          }}
        >
          {`${distance}px away`}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ChallengeUniverse({ competition }: { competition: any }) {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentNodes, setCurrentNodes] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useSpring(zoomLevel, { stiffness: 300, damping: 30 })

  const categories = Array.from(new Set(competition.challenges.map((c: any) => c.category).filter(Boolean)))

  const [stars, setStars] = useState<{
    size: number
    opacity: number
    x: number
    y: number
    animationDuration: number
  }[]>([])
  
  const handleCategoryClick = (category: string | null) => {
    setActiveCategory(category)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.2, 3)
    setZoomLevel(newZoom)
    scale.set(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.2, 0.5)
    setZoomLevel(newZoom)
    scale.set(newZoom)
  }

  const handleReset = () => {
    const resetScale = 1
    x.set(0)
    y.set(0)
    setZoomLevel(resetScale)
    scale.set(resetScale)
    setActiveCategory(null)
  }

  const isNodeVisible = (position: { x: number; y: number; z: number }) => {
    if (!containerRef.current) return true

    const { width, height } = containerRef.current.getBoundingClientRect()
    const currentX = x.get()
    const currentY = y.get()
    const currentScale = scale.get()

    const screenX = (position.x - currentX) * currentScale + width / 2
    const screenY = (position.y - currentY) * currentScale + height / 2

    const margin = 100
    return screenX > -margin && screenX < width + margin && screenY > -margin && screenY < height + margin
  }

  const getNodePositions = () => {
    const positions: any[] = []
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 500
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 500

    const challengesByCategory: Record<string, any[]> = {}
    competition.challenges.forEach((challenge: any) => {
      if (!challengesByCategory[challenge.category]) {
        challengesByCategory[challenge.category] = []
      }
      challengesByCategory[challenge.category].push(challenge)
    })

    const categoryCount = Object.keys(challengesByCategory).length
    const baseCategoryDistance = 80
    const baseSpiralDistance = 5
    const baseStep = 12 

    Object.entries(challengesByCategory).forEach(([category, challenges], categoryIndex) => {
      const categoryAngle = (categoryIndex / Math.max(1, categoryCount)) * Math.PI * 2
      const categoryDistance = baseCategoryDistance + categoryCount * 4
      const categoryCenterX = centerX + Math.cos(categoryAngle) * categoryDistance
      const categoryCenterY = centerY + Math.sin(categoryAngle) * categoryDistance

      challenges.forEach((challenge, i) => {
        const angle = (i / Math.max(1, challenges.length)) * Math.PI * 2
        const spiralStep = baseStep / Math.sqrt(Math.max(1, challenges.length))
        const spiralDistance = baseSpiralDistance + i * spiralStep
        const x = categoryCenterX + Math.cos(angle) * spiralDistance
        const y = categoryCenterY + Math.sin(angle) * spiralDistance
        const z = (Math.random() * 20 - 10) * 0.5 
        positions.push({
          challenge,
          position: { x, y, z },
        })
      })
    })

    return positions
  }

  const nodePositions = useMemo(() => getNodePositions(), [competition.challenges])

  useEffect(() => {
    const filtered = activeCategory
      ? nodePositions.filter(node => node.challenge.category?.toLowerCase() === activeCategory.toLowerCase())
      : nodePositions
    setCurrentNodes(filtered)

    if (containerRef.current && filtered.length > 0) {
      const sumX = filtered.reduce((sum, node) => sum + node.position.x, 0)
      const sumY = filtered.reduce((sum, node) => sum + node.position.y, 0)
      const avgX = sumX / filtered.length
      const avgY = sumY / filtered.length
      
      const viewportWidth = containerRef.current.offsetWidth
      const viewportHeight = containerRef.current.offsetHeight
      
      x.set(-avgX + viewportWidth / 2)
      y.set(-avgY + viewportHeight / 2)
    }
  }, [activeCategory, nodePositions])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY * -0.01
        const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 3)
        setZoomLevel(newZoom)
        scale.set(newZoom)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [zoomLevel, scale])

  useEffect(() => {
    if (stars.length === 0) {
      const starCount = 200
      const generated = Array.from({ length: starCount }).map(() => ({
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        x: Math.random() * 100,
        y: Math.random() * 100,
        animationDuration: Math.random() * 5 + 3,
      }))
      setStars(generated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderStars = () => {
    return stars.map((star, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: `${star.size}px`,
          height: `${star.size}px`,
          borderRadius: "50%",
          backgroundColor: "white",
          opacity: star.opacity,
          left: `${star.x}%`,
          top: `${star.y}%`,
          animation: `twinkle ${star.animationDuration}s infinite ease-in-out`,
        }}
      />
    ))
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        perspective: "1000px",
        backgroundColor: "black",
        cursor: "grab",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        {renderStars()}
      </div>

      {currentNodes
        .filter((node) => !isNodeVisible(node.position))
        .map((node) => (
          <DirectionIndicator
            key={`indicator-${node.challenge.id}`}
            position={node.position}
            containerRef={containerRef}
            pan={{ x: x.get(), y: y.get() }}
            scale={scale.get()}
          />
        ))}

      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          x,
          y,
          scale,
        }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        onDragEnd={() => {
          const currentX = x.get()
          const currentY = y.get()
          x.set(currentX)
          y.set(currentY)
        }}
      >
        {currentNodes.map((node) => (
          <ChallengeNode
            key={node.challenge.id}
            challenge={node.challenge}
            position={node.position}
            scale={scale.get()}
            onClick={() => setSelectedChallenge(node.challenge)}
            isSelected={selectedChallenge?.id === node.challenge.id}
            isVisible={isNodeVisible(node.position)}
          />
        ))}
      </motion.div>

      <CategoryLegend 
        categories={categories as string[]} 
        onCategoryClick={handleCategoryClick} 
        activeCategory={activeCategory}
      />

      <CompetitionInfo competition={competition} />

      <Controls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} zoomLevel={zoomLevel} />

      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeDetail challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} />
        )}
      </AnimatePresence>      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

