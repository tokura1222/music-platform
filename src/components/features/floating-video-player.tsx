"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube'
import { X, GripHorizontal } from 'lucide-react'
import { useVideo } from '@/context/VideoContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FloatingVideoPlayer() {
    const { currentMovie, isPlaying, closeMovie, setPlayingState } = useVideo()

    // Position and Size states
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [size, setSize] = useState({ width: 320, height: 180 })
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)

    // Refs
    const playerRef = useRef<YouTubePlayer | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const dragStartPos = useRef({ x: 0, y: 0 })
    const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 })

    // Reset position on initial mount (Bottom Right)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPosition({
                x: window.innerWidth - size.width - 24,
                y: window.innerHeight - size.height - 96 // Above the player bar
            })
        }
    }, [])

    // Sync isPlaying state to YouTube player
    useEffect(() => {
        if (!playerRef.current) return
        if (isPlaying) {
            playerRef.current.playVideo()
        } else {
            playerRef.current.pauseVideo()
        }
    }, [isPlaying])

    // --- Drag Handlers ---
    const handleDragStart = (e: React.PointerEvent) => {
        setIsDragging(true)
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handleDragMove = useCallback((e: PointerEvent) => {
        if (!isDragging) return

        let newX = e.clientX - dragStartPos.current.x
        let newY = e.clientY - dragStartPos.current.y

        // Constraints
        const padding = 16
        newX = Math.max(padding, Math.min(newX, window.innerWidth - size.width - padding))
        newY = Math.max(padding, Math.min(newY, window.innerHeight - size.height - 80 - padding)) // 80 is bottom bar

        setPosition({ x: newX, y: newY })
    }, [isDragging, size])

    const handleDragEnd = useCallback((e: PointerEvent) => {
        setIsDragging(false)
        if (e.target instanceof Element && e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId)
        }
    }, [])

    // --- Resize Handlers ---
    const handleResizeStart = (e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        resizeStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height
        }
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handleResizeMove = useCallback((e: PointerEvent) => {
        if (!isResizing) return

        const deltaX = resizeStartPos.current.x - e.clientX
        const deltaY = resizeStartPos.current.y - e.clientY

        // Since handle is top-left, dragging it moves the top-left corner
        // Width increases as mouse moves left (positive deltaX)
        // Height increases as mouse moves up (positive deltaY)
        let newWidth = resizeStartPos.current.width + deltaX
        let newHeight = resizeStartPos.current.height + deltaY

        // Min/Max size constraints
        newWidth = Math.max(240, Math.min(newWidth, 800))
        newHeight = Math.max(135, Math.min(newHeight, 450)) // Keep roughly 16:9 ratio manually or free

        // Adjust position so the bottom-right corner stays anchored (optional, but requested behavior usually expands outward)
        // Here we anchor the bottom-right because the resize handle is top-left
        let newX = position.x + (size.width - newWidth)
        let newY = position.y + (size.height - newHeight)

        // Screen constraints
        const padding = 16
        if (newX < padding) {
            newWidth -= (padding - newX)
            newX = padding
        }
        if (newY < padding) {
            newHeight -= (padding - newY)
            newY = padding
        }

        setSize({ width: newWidth, height: newHeight })
        setPosition({ x: newX, y: newY })

    }, [isResizing, position, size])

    const handleResizeEnd = useCallback((e: PointerEvent) => {
        setIsResizing(false)
        if (e.target instanceof Element && e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId)
        }
    }, [])

    // Global Event Listeners for smooth drag/resize outside the element bounds
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handleDragMove)
            window.addEventListener('pointerup', handleDragEnd)
        } else if (isResizing) {
            window.addEventListener('pointermove', handleResizeMove)
            window.addEventListener('pointerup', handleResizeEnd)
        }
        return () => {
            window.removeEventListener('pointermove', handleDragMove)
            window.removeEventListener('pointerup', handleDragEnd)
            window.removeEventListener('pointermove', handleResizeMove)
            window.removeEventListener('pointerup', handleResizeEnd)
        }
    }, [isDragging, isResizing, handleDragMove, handleDragEnd, handleResizeMove, handleResizeEnd])

    if (!currentMovie) return null

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
        },
    }

    const onReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target
        if (isPlaying) {
            event.target.playVideo()
        }
    }

    const onPlay: YouTubeProps['onPlay'] = () => {
        setPlayingState(true)
    }

    const onPause: YouTubeProps['onPause'] = () => {
        setPlayingState(false)
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "fixed z-[100] shadow-2xl rounded-lg overflow-hidden border border-border bg-black group",
                (isDragging || isResizing) && "select-none touch-none"
            )}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
            }}
        >
            {/* Top-Left Resize Handle */}
            <div
                className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 hover:bg-primary/50"
                onPointerDown={handleResizeStart}
                title="Resize"
            >
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-primary-foreground pointer-events-none" />
            </div>

            {/* Drag Handle (Top Bar) */}
            <div
                className="absolute top-0 left-6 right-8 h-8 cursor-move z-20 
                           bg-gradient-to-b from-black/80 to-transparent flex items-start justify-center p-1 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={handleDragStart}
                title="Drag to move"
            >
                <GripHorizontal className="h-4 w-4 text-white/50" />
            </div>

            {/* Close Button */}
            <div className="absolute top-0 right-0 h-8 flex items-start justify-end p-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-red-400 rounded-full cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        closeMovie();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* YouTube Player Base */}
            {/* CSS overlay to prevent iframe intercepting pointer events during drag/resize */}
            {(isDragging || isResizing) && (
                <div className="absolute inset-0 z-10 w-full h-full cursor-move" />
            )}
            <div className="w-full h-full pointer-events-auto">
                <YouTube
                    videoId={currentMovie.youtubeId}
                    opts={opts}
                    onReady={onReady}
                    onPlay={onPlay}
                    onPause={onPause}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                />
            </div>
        </div>
    )
}
