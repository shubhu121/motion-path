import type { Point, MotionPathExport } from './types';
import { REF_W, REF_H } from './constants';

export interface GenerateMotionPathOptions {
    points: Point[];
    boundsW: number;
    boundsH: number;
    exportNormalized: boolean;
}

export function generateMotionPath({
    points,
    boundsW,
    boundsH,
    exportNormalized,
}: GenerateMotionPathOptions): MotionPathExport {
    const pw = boundsW || 1;
    const ph = boundsH || 1;

    if (points.length === 0) {
        return { x: [], y: [], times: [], duration: 0, exportKind: 'playgroundPx' };
    }

    const sorted = [...points].sort((a, b) => a.time - b.time);
    const t0 = sorted[0].time;
    const t1 = sorted[sorted.length - 1].time;
    const span = Math.max(t1 - t0, 1e-3);
    const times = sorted.map((p) =>
        span > 0 ? (p.time - t0) / span : p.time === t0 ? 0 : 1,
    );
    const duration = t1 - t0;

    const hasOffsetData = sorted.every(
        (p) => p.ox !== undefined && p.oy !== undefined && p.session !== undefined,
    );
    const sessionIds = new Set(
        sorted.map((p) => p.session).filter((s): s is number => s !== undefined),
    );
    const singleOffsetSession = hasOffsetData && sessionIds.size === 1;

    if (singleOffsetSession) {
        let x = sorted.map((p) => p.ox ?? 0);
        let y = sorted.map((p) => p.oy ?? 0);
        if (exportNormalized) {
            x = x.map((v) => v / pw);
            y = y.map((v) => v / ph);
        }
        return { x, y, times, duration, exportKind: 'framerOffsetPx' };
    }

    const x0 = sorted[0].x;
    const y0 = sorted[0].y;
    let x = sorted.map((p) => (p.x - x0) * (pw / REF_W));
    let y = sorted.map((p) => (p.y - y0) * (ph / REF_H));
    if (exportNormalized) {
        x = x.map((v) => v / pw);
        y = y.map((v) => v / ph);
    }
    return { x, y, times, duration, exportKind: 'playgroundPx' };
}
