import { useContext } from "react";
import { CanvasContext, CanvasContextType } from "../contexts/CanvasContext";

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
