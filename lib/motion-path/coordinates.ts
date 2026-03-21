import { REF_W, REF_H, DOT_HALF } from './constants';

export function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

export function clientToLogical(clientX: number, clientY: number, rect: DOMRect) {
    const x = ((clientX - rect.left) / rect.width) * REF_W;
    const y = ((clientY - rect.top) / rect.height) * REF_H;
    return {
        x: clamp(x, 0, REF_W),
        y: clamp(y, 0, REF_H),
    };
}

export function logicalCenterToPixelTopLeft(
    logicalX: number,
    logicalY: number,
    pw: number,
    ph: number,
) {
    const cx = (logicalX / REF_W) * pw;
    const cy = (logicalY / REF_H) * ph;
    return { x: cx - DOT_HALF, y: cy - DOT_HALF };
}

export function pixelTopLeftToLogicalCenter(px: number, py: number, pw: number, ph: number) {
    const cx = px + DOT_HALF;
    const cy = py + DOT_HALF;
    return {
        x: clamp((cx / pw) * REF_W, 0, REF_W),
        y: clamp((cy / ph) * REF_H, 0, REF_H),
    };
}

export function dist2(ax: number, ay: number, bx: number, by: number) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}
