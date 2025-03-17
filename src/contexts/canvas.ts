import { createContext } from "react";
import type { CanvasContextType } from "../types/canvas";

export const CanvasContext = createContext<CanvasContextType | undefined>(
  undefined
);
