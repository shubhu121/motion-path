'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { Point } from '@/lib/motion-path/types';
import { REF_W, REF_H } from '@/lib/motion-path/constants';

interface UseCanvasDrawOptions {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    points: Point[];
    isRecording: boolean;
    theme: string | undefined;
}

export function useCanvasDraw({ canvasRef, points, isRecording, theme }: UseCanvasDrawOptions) {
    // Primitive deps where possible (rerender-dependencies)
    const pointCount = points.length;
    const isDark = theme === 'dark';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = isDark ? '#1a1a1a' : '#f3f4f6';
        ctx.fillRect(0, 0, REF_W, REF_H);

        ctx.strokeStyle = isDark ? '#2a2a2a' : '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= REF_W; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, REF_H);
            ctx.stroke();
        }
        for (let i = 0; i <= REF_H; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(REF_W, i);
            ctx.stroke();
        }

        if (points.length > 1) {
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const sorted = [...points].sort((a, b) => a.time - b.time);
            ctx.moveTo(sorted[0].x, sorted[0].y);
            for (let i = 1; i < sorted.length; i++) {
                ctx.lineTo(sorted[i].x, sorted[i].y);
            }
            ctx.stroke();
        }

        const sortedDraw = [...points].sort((a, b) => a.time - b.time);
        sortedDraw.forEach((point, index) => {
            const isLast = index === sortedDraw.length - 1;
            ctx.fillStyle = isLast ? '#ec4899' : '#a78bfa';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f3f4f6';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(index + 1), point.x, point.y);
        });

        if (isRecording) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(20, 20, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f3f4f6';
            ctx.font = '12px sans-serif';
            ctx.fillText('REC', 35, 20);
        }
        // points is intentionally included to trigger re-draw on coordinate changes,
        // but pointCount/isDark allow the linter to track stable deps correctly.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points, isRecording, isDark, pointCount]);
}
