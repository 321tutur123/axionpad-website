import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/upload/", "/track", "/account"],
      },
    ],
    sitemap: "https://axionpad.fr/sitemap.xml",
    host: "https://axionpad.fr",
  };
}
