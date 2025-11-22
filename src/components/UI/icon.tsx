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
export const Icon = ({ name, width = 20, height = 20, className, title }: IconProps) => {
  const svgDataUrl = iconMap[name];

  if (!svgDataUrl) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  try {
    // Handle both base64 data URLs and plain base64 strings
    let svgContent: string;
    if (svgDataUrl.startsWith("data:image/svg+xml;base64,")) {
      svgContent = svgDataUrl.replace(/^data:image\/svg\+xml;base64,/, "");
    } else if (svgDataUrl.startsWith("data:")) {
      // Handle other data URL formats
      const base64Match = svgDataUrl.match(/^data:[^;]+;base64,(.+)$/);
      svgContent = base64Match ? base64Match[1] : svgDataUrl;
    } else {
      // Assume it's already base64
      svgContent = svgDataUrl;
    }

    const decodedSvg = atob(svgContent);

    // Parse SVG using regex for better compatibility
    const viewBoxMatch = decodedSvg.match(/viewBox=["']([^"']+)["']/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 20 20";

    // Extract inner content by removing the outer <svg> tag
    const innerContentMatch = decodedSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    const innerContent = innerContentMatch ? innerContentMatch[1] : decodedSvg;

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
    return null;
  }
};

export default Icon;
