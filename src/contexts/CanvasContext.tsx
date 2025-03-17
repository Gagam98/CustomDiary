import { createContext } from "react";
import { CanvasContextProps } from "../types/canvas";

export const CanvasContext = createContext<CanvasContextProps | undefined>(
  undefined
);
