import { useCallback } from "react";
import type { CustomFabricObject, FabricSelectionEvent } from "../types";

export const useObjectHandlers = (
  canvas: fabric.Canvas | null,
  selectedObject: fabric.Object | null,
  setSelectedObject: (obj: fabric.Object | null) => void,
  setCurrentColor: (color: string) => void,
  setCurrentStrokeWidth: (width: number) => void,
  originalImage: fabric.Image | null,
  saveState: () => void,
) => {
  // Handle object selection
  const handleObjectSelection = useCallback(
    (e: FabricSelectionEvent) => {
      const obj = e.selected?.[0];
      if (obj) {
        setSelectedObject(obj);
        const customObj = obj as CustomFabricObject;
        // For text objects, use fill color; for others, use stroke color
        if (customObj.isText) {
          const fillColor = (obj as fabric.Textbox).fill || "#D64045";
          setCurrentColor(fillColor as string);
        } else {
          const strokeColor = customObj.stroke || "#D64045";
          const strokeWidth = customObj.strokeWidth || 2;
          setCurrentColor(strokeColor);
          setCurrentStrokeWidth(strokeWidth);
        }
      }
    },
    [setSelectedObject, setCurrentColor, setCurrentStrokeWidth],
  );

  // Handle object deselection
  const handleObjectDeselection = useCallback(() => {
    setSelectedObject(null);
  }, [setSelectedObject]);

  // Handle object deletion
  const handleDeleteObject = useCallback(() => {
    if (!canvas || !selectedObject) return;

    // Don't allow deletion of the original image
    if (selectedObject === originalImage) return;

    // If deleting a blur rect, also remove its associated blur patch
    const customObj = selectedObject as CustomFabricObject;
    if (customObj.id) {
      // Check if this is a blur rect and remove its blur patch
      const objects = canvas.getObjects();
      objects.forEach((obj: fabric.Object) => {
        const customBlurObj = obj as CustomFabricObject;
        if (customBlurObj.isBlurPatch && customBlurObj.blurRectId === customObj.id) {
          canvas.remove(obj);
        }
      });
    }

    // Remove the selected object
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    setSelectedObject(null);
    canvas.renderAll();

    // Save state for undo/redo
    saveState();
  }, [canvas, selectedObject, originalImage, setSelectedObject, saveState]);

  // Handle color change - affects selected object, draw brush, and new shapes
  const handleColorChange = useCallback(
    (color: string) => {
      setCurrentColor(color);
      if (selectedObject) {
        const customObj = selectedObject as CustomFabricObject;
        // For text objects, update fill; for others, update stroke
        if (customObj.isText) {
          selectedObject.set({
            fill: color,
            cornerColor: color,
            borderColor: color,
          });
        } else {
          selectedObject.set({
            stroke: color,
            cornerColor: color,
            borderColor: color,
          });
        }
        canvas?.renderAll();
      }
      // Update draw brush color
      if (canvas && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color;
      }
    },
    [selectedObject, canvas, setCurrentColor],
  );

  // Handle stroke width change - affects selected object, draw brush, and new shapes
  const handleStrokeWidthChange = useCallback(
    (width: number) => {
      setCurrentStrokeWidth(width);
      const customObj = selectedObject as CustomFabricObject;
      // Don't apply stroke width to text objects (they use fontSize)
      if (selectedObject && !customObj.isText) {
        selectedObject.set({ strokeWidth: width });
        canvas?.renderAll();
      }
      // Update draw brush width
      if (canvas && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = width;
      }
    },
    [selectedObject, canvas, setCurrentStrokeWidth],
  );

  return {
    handleObjectSelection,
    handleObjectDeselection,
    handleDeleteObject,
    handleColorChange,
    handleStrokeWidthChange,
  };
};
