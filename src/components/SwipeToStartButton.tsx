import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

type SwipeToStartButtonProps = {
  onStart: () => void;
  isTracking: boolean;
};

export function SwipeToStartButton({ onStart, isTracking }: SwipeToStartButtonProps) {
  const [isStarted, setIsStarted] = useState(isTracking);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Update local state if tracking state changes externally
  useEffect(() => {
    setIsStarted(isTracking);
  }, [isTracking]);

  // Calculate opacity based on drag position
  const textOpacity = useTransform(x, [0, 150], [1, 0]);

  const handleDragEnd = async (event: any, info: any) => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const swipeThreshold = containerWidth * 0.6; // 60% of the container width

    if (info.offset.x > swipeThreshold) {
      // Success! Snap to end
      await controls.start({ x: containerWidth - 72 /* width of knob + padding */ });
      setIsStarted(true);
      onStart();
    } else {
      // Failed, snap back to start
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  if (isStarted) {
    return (
      <div className="mt-4 flex h-16 w-full items-center justify-center rounded-3xl bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
        <span className="font-bold text-white tracking-wide">Ride in Progress...</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative mt-4 flex h-16 w-full items-center rounded-3xl bg-white/5 border border-white/10 p-2 overflow-hidden"
    >
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="absolute left-2 z-10 flex h-12 w-20 cursor-grab active:cursor-grabbing items-center justify-center rounded-2xl bg-orange-600 shadow-lg touch-none"
      >
        <span className="material-symbols-outlined text-[24px] text-white">directions_bike</span>
      </motion.div>
      
      <motion.div 
        style={{ opacity: textOpacity }}
        className="pointer-events-none flex w-full justify-center pl-12"
      >
        <span className="text-[15px] font-medium text-slate-400">Swipe to start ride &gt;</span>
      </motion.div>
    </div>
  );
}
