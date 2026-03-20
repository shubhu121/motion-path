import { getSiteUrl, siteConfig } from "@/lib/site-config";

export function JsonLd() {
    const url = getSiteUrl();
    const data = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: siteConfig.name,
        description: siteConfig.description,
        url,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    };

    return (
        <script
            type="application/ld+json"
            // JSON-LD must be a raw script body; there is no React children API for this.
            // biome-ignore lint/security/noDangerouslySetInnerHtml: schema.org structured data
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
