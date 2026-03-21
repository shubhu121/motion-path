'use client';

import { useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type { MotionValue } from 'motion/react';
import type { Point } from '@/lib/motion-path/types';
import { interpolateAt } from '@/lib/motion-path/interpolate';
import { logicalCenterToPixelTopLeft } from '@/lib/motion-path/coordinates';

interface UseMotionPlaybackOptions {
    playgroundRef: RefObject<HTMLDivElement | null>;
    motionX: MotionValue<number>;
    motionY: MotionValue<number>;
}

export function useMotionPlayback({ playgroundRef, motionX, motionY }: UseMotionPlaybackOptions) {
    const [isPlaying, setIsPlaying] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    const stopPlayback = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const startPlayback = useCallback(
        (points: Point[]) => {
            if (points.length === 0) return;
            setIsPlaying(true);
            const sorted = [...points].sort((a, b) => a.time - b.time);
            const maxTime = Math.max(sorted[sorted.length - 1].time, 0.01);
            const startTime = Date.now();

            const tick = () => {
                const el = playgroundRef.current;
                const pw = el?.clientWidth ?? 0;
                const ph = el?.clientHeight ?? 0;
                const elapsed = (Date.now() - startTime) / 1000;
                const t = Math.min(elapsed, maxTime);
                const { x: lx, y: ly } = interpolateAt(points, t);
                if (pw > 0 && ph > 0) {
                    const { x, y } = logicalCenterToPixelTopLeft(lx, ly, pw, ph);
                    motionX.set(x);
                    motionY.set(y);
                }
                if (elapsed < maxTime) {
                    animationFrameRef.current = requestAnimationFrame(tick);
                } else {
                    setIsPlaying(false);
                    animationFrameRef.current = null;
                }
            };

            animationFrameRef.current = requestAnimationFrame(tick);
        },
        [playgroundRef, motionX, motionY],
    );

    return { isPlaying, animationFrameRef, startPlayback, stopPlayback };
}
