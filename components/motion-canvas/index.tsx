'use client';

import { useRef, useState, useCallback, useLayoutEffect, useMemo, useEffect } from 'react';
import { useMotionValue } from 'motion/react';
import { useTheme } from 'next-themes';
import { Card, CardHeader } from '@/components/ui/card';

import type { Point } from '@/lib/motion-path/types';
import { REF_W, REF_H, RECORDING_COMING_SOON } from '@/lib/motion-path/constants';
import { logicalCenterToPixelTopLeft } from '@/lib/motion-path/coordinates';
import { generateMotionPath } from '@/lib/motion-path/generate';

import { useCanvasDraw } from '@/hooks/use-canvas-draw';
import { useMotionPlayback } from '@/hooks/use-motion-playback';
import { usePointInteraction } from '@/hooks/use-point-interaction';

import { StatsBar } from './stats-bar';
import { CanvasEditor } from './canvas-editor';
import { CodePanel } from './code-panel';
import { CoordinateExplainer } from './coordinate-explainer';
import { MotionPathPreview } from '@/components/motion-path-preview';

export function MotionCanvas() {
    const playgroundRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const recordingStartRef = useRef<number | null>(null);

    const [points, setPoints] = useState<Point[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [activePointIndex, setActivePointIndex] = useState(0);
    const [bounds, setBounds] = useState({ w: 0, h: 0 });
    const [exportNormalized, setExportNormalized] = useState(false);

    const { theme } = useTheme();
    const motionX = useMotionValue(0);
    const motionY = useMotionValue(0);

    // Observe playground size changes
    useEffect(() => {
        const el = playgroundRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = Math.round(el.clientWidth);
            const h = Math.round(el.clientHeight);
            setBounds((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
        });
        ro.observe(el);
        setBounds({ w: Math.round(el.clientWidth), h: Math.round(el.clientHeight) });
        return () => ro.disconnect();
    }, []);

    const { isPlaying, animationFrameRef, startPlayback, stopPlayback } = useMotionPlayback({
        playgroundRef,
        motionX,
        motionY,
    });

    const {
        isDraggingRef,
        handleBackgroundPointerDown,
        handleDragStart,
        handleDrag,
        handleDragEnd,
    } = usePointInteraction({
        playgroundRef,
        motionX,
        motionY,
        points,
        isPlaying,
        isRecording,
        activePointIndex,
        recordingStartRef,
        setPoints,
        setActivePointIndex,
    });

    useCanvasDraw({ canvasRef, points, isRecording, theme });

    // Sync the draggable dot position to the active point whenever not animating/dragging
    useLayoutEffect(() => {
        if (isPlaying || isDraggingRef.current) return;
        const w = bounds.w;
        const h = bounds.h;
        if (w <= 0 || h <= 0) return;

        let lx: number;
        let ly: number;
        if (isRecording) {
            if (points.length === 0) {
                lx = REF_W / 2;
                ly = REF_H / 2;
            } else {
                const p = points[points.length - 1];
                lx = p.x;
                ly = p.y;
            }
        } else if (points.length === 0) {
            lx = REF_W / 2;
            ly = REF_H / 2;
        } else {
            const i = Math.min(Math.max(activePointIndex, 0), points.length - 1);
            lx = points[i].x;
            ly = points[i].y;
        }

        const { x, y } = logicalCenterToPixelTopLeft(lx, ly, w, h);
        motionX.set(x);
        motionY.set(y);
    }, [
        isPlaying,
        isDraggingRef,
        isRecording,
        points,
        activePointIndex,
        bounds.w,
        bounds.h,
        motionX,
        motionY,
    ]);

    const toggleRecording = useCallback(() => {
        if (RECORDING_COMING_SOON) return;
        if (!isRecording) {
            setPoints([]);
            setActivePointIndex(0);
            recordingStartRef.current = Date.now();
            setIsRecording(true);
        } else {
            setIsRecording(false);
            recordingStartRef.current = null;
        }
    }, [isRecording]);

    const reset = useCallback(() => {
        setPoints([]);
        setIsRecording(false);
        setActivePointIndex(0);
        recordingStartRef.current = null;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        stopPlayback();
    }, [animationFrameRef, stopPlayback]);

    const exportPath = useMemo(
        () =>
            generateMotionPath({
                points,
                boundsW: bounds.w,
                boundsH: bounds.h,
                exportNormalized,
            }),
        [points, bounds.w, bounds.h, exportNormalized],
    );

    const maxTime = useMemo(
        () => (points.length === 0 ? 0 : Math.max(...points.map((p) => p.time), 0)),
        [points],
    );

    const previewPathKey = useMemo(() => {
        if (points.length === 0) return 'empty';
        const sorted = [...points].sort((a, b) => a.time - b.time);
        const sig = sorted
            .map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.time.toFixed(4)}`)
            .join(';');
        return `${sig}|n:${exportNormalized ? 1 : 0}|k:${exportPath.exportKind}`;
    }, [points, exportNormalized, exportPath.exportKind]);

    const pathStartTopLeft = useMemo(() => {
        if (points.length === 0) return { x: 0, y: 0 };
        const sorted = [...points].sort((a, b) => a.time - b.time);
        const p0 = sorted[0];
        const pw = Math.max(bounds.w, 1);
        const ph = Math.max(bounds.h, 1);
        return logicalCenterToPixelTopLeft(p0.x, p0.y, pw, ph);
    }, [points, bounds.w, bounds.h]);

    const generatedCode = useMemo(() => {
        const path = exportPath;
        const dur = Math.max(path.duration, 0.01);
        const pw = bounds.w || REF_W;
        const ph = bounds.h || REF_H;

        const scaleNote =
            path.exportKind === 'framerOffsetPx'
                ? exportNormalized
                    ? `// x/y = Framer drag info.offset (normalized by current playground ${pw.toFixed(0)}×${ph.toFixed(0)}px). Multiply x by container width and y by height in your app.`
                    : `// x/y = Framer drag info.offset in CSS pixels from gesture start. Matches transform space when your motion element uses the same scale as this playground (${pw.toFixed(0)}×${ph.toFixed(0)}px).`
                : exportNormalized
                  ? `// x/y = deltas along the path, normalized by playground size. Scale with your container width/height.`
                  : `// x/y = pixel deltas from first keyframe, scaled from logical path for playground ${pw.toFixed(0)}×${ph.toFixed(0)}px (aspect ${REF_W}:${REF_H}).`;

        return `${scaleNote}
// Place the motion node at the path start (first waypoint in the editor); x/y keyframes are relative to that origin.

import { motion } from 'framer-motion';

export function AnimatedElement() {
  return (
    <motion.div
      animate={{ x: [${path.x.join(', ')}], y: [${path.y.join(', ')}] }}
      transition={{
        duration: ${dur.toFixed(3)},
        times: [${path.times.map((t) => t.toFixed(4)).join(', ')}],
        ease: 'linear',
      }}
    >
      Your content here
    </motion.div>
  );
}`;
    }, [exportPath, bounds.w, bounds.h, exportNormalized]);

    const generatedCodeBlockData = useMemo(
        () => [{ language: 'tsx', filename: 'AnimatedElement.tsx', code: generatedCode }],
        [generatedCode],
    );

    return (
        <div className="flex h-full w-full min-w-0 flex-col gap-6">
            <header className="min-w-0">
                <Card className="gap-2 border-0 bg-transparent py-0 shadow-none ring-0">
                    <CardHeader className="space-y-2 border-border px-0 pb-0">
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Drag-based path recording (
                            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                                info.offset
                            </code>
                            ) is coming soon. For now, click to add waypoints and drag the dot to
                            edit—exports use pixel deltas for your current playground size.
                        </p>
                    </CardHeader>
                </Card>
            </header>

            <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
                <div className="flex h-full min-w-0 flex-col gap-4">
                    <StatsBar
                        pointCount={points.length}
                        duration={maxTime}
                        exportKind={exportPath.exportKind}
                        boundsW={bounds.w}
                        boundsH={bounds.h}
                    />

                    <CanvasEditor
                        playgroundRef={playgroundRef}
                        canvasRef={canvasRef}
                        motionX={motionX}
                        motionY={motionY}
                        points={points}
                        isPlaying={isPlaying}
                        isRecording={isRecording}
                        exportNormalized={exportNormalized}
                        onPointerDown={handleBackgroundPointerDown}
                        onDragStart={handleDragStart}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        onToggleRecording={toggleRecording}
                        onPlay={() => startPlayback(points)}
                        onStop={stopPlayback}
                        onReset={reset}
                        onExportNormalizedChange={setExportNormalized}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
                    <MotionPathPreview
                        x={exportPath.x}
                        y={exportPath.y}
                        times={exportPath.times}
                        duration={exportPath.duration}
                        pathKey={previewPathKey}
                        editorW={Math.max(bounds.w, 1)}
                        editorH={Math.max(bounds.h, 1)}
                        pathStartTopLeft={pathStartTopLeft}
                        exportNormalized={exportNormalized}
                    />
                    <CoordinateExplainer />
                </div>
            </div>

            {points.length > 0 && (
                <CodePanel
                    pointCount={points.length}
                    codeBlockData={generatedCodeBlockData}
                />
            )}
        </div>
    );
}
