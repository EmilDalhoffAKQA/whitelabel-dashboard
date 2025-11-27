"use client";

import { useEffect } from "react";

interface DynamicFaviconProps {
  faviconUrl?: string;
  workspaceName?: string;
}

export function DynamicFavicon({
  faviconUrl,
  workspaceName,
}: DynamicFaviconProps) {
  useEffect(() => {
    if (!faviconUrl) return;

    // Remove existing favicons
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((link) => link.remove());

    // Add new favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = faviconUrl;
    link.type = "image/x-icon";
    document.head.appendChild(link);

    // Add apple-touch-icon for iOS
    const appleTouchIcon = document.createElement("link");
    appleTouchIcon.rel = "apple-touch-icon";
    appleTouchIcon.href = faviconUrl;
    document.head.appendChild(appleTouchIcon);

    // Update page title if workspace name is provided
    if (workspaceName) {
      const titleElement = document.querySelector("title");
      if (titleElement) {
        const currentTitle = titleElement.textContent || "";
        // Only update if it doesn't already include the workspace name
        if (!currentTitle.includes(workspaceName)) {
          titleElement.textContent = `${workspaceName} Dashboard`;
        }
      }
    }

    // Cleanup function
    return () => {
      // Keep the favicon when unmounting (optional)
    };
  }, [faviconUrl, workspaceName]);

  return null; // This component doesn't render anything
}
