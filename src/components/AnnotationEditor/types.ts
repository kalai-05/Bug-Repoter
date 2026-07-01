export type AnnotationTool = 'arrow' | 'rectangle' | 'circle' | 'highlight' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  tool: AnnotationTool;
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
  /** Only for text tool */
  text?: string;
  /** Display-space font size (scaled up on export) */
  fontSize?: number;
}

export interface ActiveTextInput {
  point: Point;
  value: string;
}

export const PRESET_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#22C55E', // green
  '#FBBF24', // yellow (also used for highlight)
  '#FFFFFF', // white
] as const;

export const STROKE_THIN = 2;
export const STROKE_THICK = 4;
export const TEXT_FONT_SIZE = 14;
export const HIGHLIGHT_ALPHA = 0.38;
