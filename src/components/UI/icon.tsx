import { IconNamesType } from "../../constants/icons";

// Import SVG icons as React components
// These will be transformed by rollup-plugin-svg
import blurIcon from "../../../public/assets/icons/blur.svg";
import circleIcon from "../../../public/assets/icons/circle.svg";
import cropIcon from "../../../public/assets/icons/crop.svg";
import cursorIcon from "../../../public/assets/icons/cursor.svg";
import pencilIcon from "../../../public/assets/icons/pencil.svg";
import redoIcon from "../../../public/assets/icons/redo.svg";
import squareIcon from "../../../public/assets/icons/square.svg";
import undoIcon from "../../../public/assets/icons/undo.svg";
import trashIcon from "../../../public/assets/icons/trash.svg";
import textIcon from "../../../public/assets/icons/text.svg";

// Icon mapping - only include icons that actually exist
const iconMap: Partial<Record<IconNamesType, string>> = {
  blur: blurIcon,
  circle: circleIcon,
  crop: cropIcon,
  cursor: cursorIcon,
  pencil: pencilIcon,
  redo: redoIcon,
  square: squareIcon,
  undo: undoIcon,
  trash: trashIcon,
  text: textIcon,
};

interface IconProps {
  /** Name of the icon to render */
  name: IconNamesType;
  /** Width of the icon (default: 20) */
  width?: number;
  /** Height of the icon (default: 20) */
  height?: number;
  /** Additional CSS classes for styling (use text-* classes for color) */
  className?: string;
  /** Optional title for accessibility */
  title?: string;
}

/**
 * Icon component that renders SVG icons inline
 *
 * Features:
 * - Inline SVG rendering for better performance
 * - Color control through CSS classes (text-*)
 * - Type-safe icon names
 * - Bundled with the library (no external dependencies)
 */
// Safe base64 decoder that works in all environments
const base64Decode = (base64: string): string => {
  try {
    // Use browser's atob if available
    if (typeof atob !== "undefined") {
      return atob(base64);
    }
    
    // Fallback for Node.js/server environments
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("utf8");
    }
    
    // Manual base64 decoding as last resort
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let str = "";
    let i = 0;
    
    base64 = base64.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    
    while (i < base64.length) {
      const enc1 = chars.indexOf(base64.charAt(i++));
      const enc2 = chars.indexOf(base64.charAt(i++));
      const enc3 = chars.indexOf(base64.charAt(i++));
      const enc4 = chars.indexOf(base64.charAt(i++));
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      
      str += String.fromCharCode(chr1);
      if (enc3 !== 64) str += String.fromCharCode(chr2);
      if (enc4 !== 64) str += String.fromCharCode(chr3);
    }
    
    return str;
  } catch (error) {
    console.error("Base64 decoding error:", error);
    throw error;
  }
};

export const Icon = ({ name, width = 20, height = 20, className, title }: IconProps) => {
  const svgDataUrl = iconMap[name];

  if (!svgDataUrl) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  try {
    // Handle both base64 data URLs and plain base64 strings
    let svgContent: string;
    if (typeof svgDataUrl === "string" && svgDataUrl.startsWith("data:image/svg+xml;base64,")) {
      svgContent = svgDataUrl.replace(/^data:image\/svg\+xml;base64,/, "");
    } else if (typeof svgDataUrl === "string" && svgDataUrl.startsWith("data:")) {
      // Handle other data URL formats
      const base64Match = svgDataUrl.match(/^data:[^;]+;base64,(.+)$/);
      svgContent = base64Match ? base64Match[1] : svgDataUrl;
    } else if (typeof svgDataUrl === "string") {
      // Assume it's already base64
      svgContent = svgDataUrl;
    } else {
      console.warn(`Icon "${name}" has invalid format`);
      return null;
    }

    const decodedSvg = base64Decode(svgContent);

    if (!decodedSvg || !decodedSvg.trim()) {
      console.warn(`Icon "${name}" decoded to empty string`);
      return null;
    }

    // Parse SVG using regex for better compatibility
    const viewBoxMatch = decodedSvg.match(/viewBox=["']([^"']+)["']/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 20 20";

    // Extract inner content by removing the outer <svg> tag
    const innerContentMatch = decodedSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    const innerContent = innerContentMatch ? innerContentMatch[1] : decodedSvg;

    if (!innerContent) {
      console.warn(`Icon "${name}" has no content`);
      return null;
    }

    return (
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className || ""}`}
        role="img"
        aria-hidden={!title}
        {...(title && { "aria-label": title })}
      >
        {title && <title>{title}</title>}
        <g dangerouslySetInnerHTML={{ __html: innerContent }} />
      </svg>
    );
  } catch (error) {
    console.error(`Error decoding icon "${name}":`, error);
    // Return a fallback empty SVG instead of null to prevent layout shifts
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className || ""}`}
        role="img"
      >
        <title>{title || name}</title>
      </svg>
    );
  }
};

export default Icon;
