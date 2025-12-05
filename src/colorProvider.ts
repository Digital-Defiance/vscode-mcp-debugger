import { ColorInformation, Color, ColorPresentation, Range } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Provide color information for debugger code
 */
export function getDocumentColors(document: TextDocument): ColorInformation[] {
  const colors: ColorInformation[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    // Detect severity colors in comments or strings
    const severityColors: Record<string, Color> = {
      error: { red: 1, green: 0, blue: 0, alpha: 1 },
      warning: { red: 1, green: 0.65, blue: 0, alpha: 1 },
      info: { red: 0, green: 0.5, blue: 1, alpha: 1 },
      success: { red: 0, green: 0.8, blue: 0, alpha: 1 },
    };

    Object.entries(severityColors).forEach(([severity, color]) => {
      const regex = new RegExp(`\\b${severity}\\b`, "gi");
      let match;
      while ((match = regex.exec(line)) !== null) {
        colors.push({
          range: Range.create(lineIndex, match.index, lineIndex, match.index + severity.length),
          color,
        });
      }
    });
  });

  return colors;
}

/**
 * Provide color presentations
 */
export function getColorPresentations(color: Color): ColorPresentation[] {
  const { red, green, blue, alpha } = color;
  return [
    { label: `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})` },
    { label: `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})` },
  ];
}
