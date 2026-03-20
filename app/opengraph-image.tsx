import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const alt = siteConfig.title.default;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    background: "linear-gradient(145deg, #fafafa 0%, #ece8f4 45%, #e2dcf2 100%)",
                    padding: 72,
                }}
            >
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 300,
                        letterSpacing: "-0.03em",
                        color: "#111111",
                    }}
                >
                    {siteConfig.name}
                </div>
                <div
                    style={{
                        marginTop: 20,
                        fontSize: 26,
                        fontWeight: 400,
                        lineHeight: 1.35,
                        color: "#444444",
                        maxWidth: 820,
                    }}
                >
                    Record paths that line up with Framer Motion — offset-aware exports and
                    free-draw keyframes.
                </div>
            </div>
        ),
        { ...size },
    );
}
