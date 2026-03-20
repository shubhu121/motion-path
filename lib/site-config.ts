/** Canonical site URL for metadata, sitemap, and robots. Set in production (e.g. Vercel project env). */
export function getSiteUrl(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return raw.replace(/\/$/, "");
}

export const siteConfig = {
    name: "Motion Path",
    shortName: "Motion Path",
    title: {
        default:
            "Motion Path — Record motion paths for Framer Motion",
        template: "%s | Motion Path",
    },
    description:
        "Record motion paths that align with Framer Motion. Uses drag info.offset (px from drag start) for accurate transform animations; free-draw paths export as pixel deltas for your playground size.",
    keywords: [
        "motion path",
        "Framer Motion",
        "animation",
        "keyframes",
        "SVG path",
        "transform animation",
        "info.offset",
        "motion recording",
        "path export",
        "React animation",
    ],
    locale: "en_US",
} as const;
