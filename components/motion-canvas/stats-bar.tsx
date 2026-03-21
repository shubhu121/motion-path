import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    IconLocation2FillDuo18,
    IconTimer2FillDuo18,
    IconInboxArrowDownFillDuo18,
    IconGamingButtonsFillDuo18,
} from 'nucleo-ui-essential-fill-duo-18';

interface StatsBarProps {
    pointCount: number;
    duration: number;
    exportKind: 'framerOffsetPx' | 'playgroundPx';
    boundsW: number;
    boundsH: number;
}

// rerender-memo: memoized to prevent re-renders driven only by canvas/drag state
export const StatsBar = memo(function StatsBar({
    pointCount,
    duration,
    exportKind,
    boundsW,
    boundsH,
}: StatsBarProps) {
    return (
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Card size="sm">
                <CardHeader className="gap-2">
                    <CardDescription className="flex items-center gap-2 font-medium">
                        <IconLocation2FillDuo18 className="size-4 shrink-0" />
                        Points
                    </CardDescription>
                    <CardTitle className="font-sans text-xl font-semibold tabular-nums">
                        {pointCount}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card size="sm">
                <CardHeader className="gap-2">
                    <CardDescription className="flex items-center gap-2 font-medium">
                        <IconTimer2FillDuo18 className="size-4 shrink-0" />
                        Duration
                    </CardDescription>
                    <CardTitle className="font-sans text-xl font-semibold tabular-nums">
                        {duration.toFixed(2)}s
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card size="sm">
                <CardHeader className="gap-2">
                    <CardDescription className="flex items-center gap-2 font-medium">
                        <IconInboxArrowDownFillDuo18 className="size-4 shrink-0" />
                        Export
                    </CardDescription>
                    <CardTitle className="font-sans text-xl font-medium leading-tight">
                        {exportKind === 'framerOffsetPx' ? 'Offset px' : 'Path px'}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card size="sm">
                <CardHeader className="gap-2">
                    <CardDescription className="flex items-center gap-2 font-medium">
                        <IconGamingButtonsFillDuo18 className="size-4 shrink-0" />
                        Playground
                    </CardDescription>
                    <CardTitle className="font-sans text-xl font-medium tabular-nums">
                        {boundsW > 0 ? `${Math.round(boundsW)}×${Math.round(boundsH)}` : '—'}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
});
