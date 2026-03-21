'use client';

import type { RefObject } from 'react';
import type { MotionValue, PanInfo } from 'motion/react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { IconCircleCompose2FillDuo18 } from 'nucleo-ui-essential-fill-duo-18';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { REF_W, REF_H, RECORDING_COMING_SOON } from '@/lib/motion-path/constants';
import type { Point } from '@/lib/motion-path/types';

interface CanvasEditorProps {
    playgroundRef: RefObject<HTMLDivElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    motionX: MotionValue<number>;
    motionY: MotionValue<number>;
    points: Point[];
    isPlaying: boolean;
    isRecording: boolean;
    exportNormalized: boolean;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onDragStart: () => void;
    onDrag: (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
    onDragEnd: (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
    onToggleRecording: () => void;
    onPlay: () => void;
    onStop: () => void;
    onReset: () => void;
    onExportNormalizedChange: (checked: boolean) => void;
}

export function CanvasEditor({
    playgroundRef,
    canvasRef,
    motionX,
    motionY,
    points,
    isPlaying,
    isRecording,
    exportNormalized,
    onPointerDown,
    onDragStart,
    onDrag,
    onDragEnd,
    onToggleRecording,
    onPlay,
    onStop,
    onReset,
    onExportNormalizedChange,
}: CanvasEditorProps) {
    const dragEnabled = isRecording || points.length > 0;

    return (
        <Card className="flex flex-1 flex-col">
            <CardHeader>
                <h2 className="font-heading flex items-center gap-2 text-lg font-medium">
                    <IconCircleCompose2FillDuo18 className="size-6" aria-hidden />
                    Editor
                </h2>
                <CardDescription>
                    Click to add waypoints and drag the dot to edit. Drag-to-record (
                    <code className="text-xs">info.offset</code>) is coming soon.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col pt-0">
                <div
                    ref={playgroundRef}
                    className="relative w-full min-w-0 overflow-hidden rounded-lg bg-accent"
                    style={{ aspectRatio: `${REF_W}/${REF_H}` }}
                >
                    <canvas
                        ref={canvasRef}
                        width={REF_W}
                        height={REF_H}
                        className="pointer-events-none absolute inset-0 size-full"
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 z-0 cursor-crosshair touch-none"
                        onPointerDown={onPointerDown}
                    />
                    <motion.div
                        className="absolute left-0 top-0 z-10 size-6 cursor-grab touch-none rounded-full bg-red-400 active:cursor-grabbing"
                        style={{ x: motionX, y: motionY }}
                        drag={dragEnabled && !isPlaying}
                        dragConstraints={playgroundRef}
                        dragElastic={0}
                        dragMomentum={false}
                        onDragStart={onDragStart}
                        onDrag={onDrag}
                        onDragEnd={onDragEnd}
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                        onClick={onToggleRecording}
                        variant={isRecording ? 'destructive' : 'default'}
                        className="w-full"
                        disabled={isPlaying || RECORDING_COMING_SOON}
                        title={
                            RECORDING_COMING_SOON
                                ? 'Path recording will be available in a future update'
                                : undefined
                        }
                    >
                        {RECORDING_COMING_SOON
                            ? 'Recording — coming soon'
                            : isRecording
                              ? 'Stop Recording'
                              : 'Start Recording'}
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            onClick={isPlaying ? onStop : onPlay}
                            variant="outline"
                            className="flex-1 gap-2"
                            disabled={points.length === 0}
                        >
                            {isPlaying ? (
                                <>
                                    <Pause size={16} /> Pause
                                </>
                            ) : (
                                <>
                                    <Play size={16} /> Play
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={onReset}
                            variant="outline"
                            className="flex-1 gap-2"
                            disabled={points.length === 0 && !isRecording}
                        >
                            <RotateCcw size={16} /> Clear
                        </Button>
                    </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        className="size-4 rounded border-border"
                        checked={exportNormalized}
                        onChange={(e) => onExportNormalizedChange(e.target.checked)}
                    />
                    Export normalized (0–1) values
                </label>
            </CardFooter>
        </Card>
    );
}
