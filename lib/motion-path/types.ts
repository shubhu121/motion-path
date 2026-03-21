export interface Point {
    x: number;
    y: number;
    time: number;
    ox?: number;
    oy?: number;
    session?: number;
}

export interface MotionPathExport {
    x: number[];
    y: number[];
    times: number[];
    duration: number;
    exportKind: 'framerOffsetPx' | 'playgroundPx';
}
