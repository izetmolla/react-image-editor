import { fabric } from "fabric";
import { useCallback } from "react";

export const useTextHandlers = (
  canvas: fabric.Canvas | null,
  isCropping: boolean,
  isDrawing: boolean,
  currentColor: string,
  setIsSelectMode: (value: boolean) => void,
  setSelectedObject: (obj: fabric.Object | null) => void,
  saveState: () => void,
) => {
  const handleAddText = useCallback(() => {
    if (!canvas || isCropping || isDrawing) return;

    setIsSelectMode(false); // Exit select mode when adding text

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Create a textbox that can be edited
    const textbox = new fabric.Textbox("Edit me", {
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      width: 200,
      fontSize: 24,
      fontFamily: "Arial",
      fill: currentColor,
      originX: "center",
      originY: "center",
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: "circle",
      cornerColor: currentColor,
      cornerSize: 10,
      transparentCorners: false,
      borderColor: currentColor,
      textAlign: "center",
      splitByGrapheme: true,
      editable: true,
    });

    // Add custom property for identification
    (textbox as any).isText = true;

    // Add the textbox to canvas
    canvas.add(textbox);

    // Set as active object and update selection
    canvas.setActiveObject(textbox);
    setSelectedObject(textbox);

    // Enter editing mode immediately
    textbox.enterEditing();
    textbox.selectAll();

    // Save state for undo/redo
    saveState();

    // Render canvas
    canvas.renderAll();

    // Save state after text editing is done
    const handleEditingExited = () => {
      textbox.off("editing:exited", handleEditingExited);
      saveState();
      canvas.renderAll();
    };

    textbox.on("editing:exited", handleEditingExited);
  }, [canvas, isCropping, isDrawing, currentColor, setIsSelectMode, setSelectedObject, saveState]);

  return {
    handleAddText,
  };
};



