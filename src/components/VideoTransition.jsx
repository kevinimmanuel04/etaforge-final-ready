import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoTransition = ({ videoSrc, isActive, onComplete, exitDirection = 'right' }) => {
  const [shouldSlideOut, setShouldSlideOut] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Video playback failed:', err);
        // If video fails, complete transition immediately
        handleComplete();
      });
    }
  }, [isActive]);

  const handleVideoEnd = () => {
    // Start slide-out animation
    setShouldSlideOut(true);
    
    // Wait for slide-out animation to complete, then call onComplete
    setTimeout(() => {
      handleComplete();
    }, 600); // Match animation duration
  };

  const handleComplete = () => {
    setShouldSlideOut(false);
    if (onComplete) onComplete();
  };

  if (!isActive) return null;

  if (!isActive) return null;

  const getExitAnimation = () => {
    if (exitDirection === 'fade') {
      return { opacity: shouldSlideOut ? 0 : 1 };
    }
    const exitTarget = exitDirection === 'left' ? '-100%' : '100%';
    return { x: shouldSlideOut ? exitTarget : 0 };
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        onDoubleClick={handleSkip}
        initial={exitDirection === 'fade' ? { opacity: 1 } : { x: 0 }}
        animate={getExitAnimation()}
        exit={exitDirection === 'fade' ? { opacity: 0 } : { x: exitDirection === 'left' ? '-100%' : '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer' // Add pointer cursor to indicate interactability
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          onEnded={handleVideoEnd}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoTransition;
