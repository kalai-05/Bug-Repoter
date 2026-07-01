import { useState, useCallback } from 'react';
import type { Annotation, AnnotationTool, Point, ActiveTextInput } from './types';
import { PRESET_COLORS, STROKE_THIN, TEXT_FONT_SIZE } from './types';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export interface UseAnnotationReturn {
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  annotations: Annotation[];
  /** Shape currently being drawn (preview, not yet committed). */
  activeAnnotation: Annotation | null;
  textInput: ActiveTextInput | null;
  canUndo: boolean;
  canRedo: boolean;
  setTool: (t: AnnotationTool) => void;
  setColor: (c: string) => void;
  setStrokeWidth: (w: number) => void;
  startDraw: (point: Point) => void;
  continueDraw: (point: Point) => void;
  endDraw: (point: Point) => void;
  cancelDraw: () => void;
  updateTextValue: (v: string) => void;
  commitText: () => void;
  cancelText: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export function useAnnotation(): UseAnnotationReturn {
  const [tool, setTool] = useState<AnnotationTool>('arrow');
  const [color, setColor] = useState<string>(PRESET_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_THIN);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);

  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [textInput, setTextInput] = useState<ActiveTextInput | null>(null);

  // Commit a new annotation array to history
  const commit = useCallback(
    (next: Annotation[]) => {
      setUndoStack((u) => [...u, annotations]);
      setRedoStack([]);
      setAnnotations(next);
    },
    [annotations],
  );

  const startDraw = useCallback(
    (point: Point) => {
      if (tool === 'text') {
        setTextInput({ point, value: '' });
        return;
      }
      setActiveAnnotation({
        id: uid(),
        tool,
        start: point,
        end: point,
        color,
        strokeWidth,
      });
    },
    [tool, color, strokeWidth],
  );

  const continueDraw = useCallback((point: Point) => {
    setActiveAnnotation((prev) => (prev ? { ...prev, end: point } : null));
  }, []);

  const endDraw = useCallback(
    (point: Point) => {
      setActiveAnnotation((prev) => {
        if (!prev) return null;
        const final = { ...prev, end: point };
        const dx = Math.abs(final.end.x - final.start.x);
        const dy = Math.abs(final.end.y - final.start.y);
        // Discard accidental micro-clicks (< 4px movement)
        if (dx >= 4 || dy >= 4) {
          commit([...annotations, final]);
        }
        return null;
      });
    },
    [annotations, commit],
  );

  const cancelDraw = useCallback(() => setActiveAnnotation(null), []);

  const updateTextValue = useCallback(
    (v: string) => setTextInput((prev) => (prev ? { ...prev, value: v } : null)),
    [],
  );

  const commitText = useCallback(() => {
    if (textInput?.value.trim()) {
      commit([
        ...annotations,
        {
          id: uid(),
          tool: 'text',
          start: textInput.point,
          end: textInput.point,
          color,
          strokeWidth,
          text: textInput.value.trim(),
          fontSize: TEXT_FONT_SIZE,
        },
      ]);
    }
    setTextInput(null);
  }, [textInput, color, strokeWidth, annotations, commit]);

  const cancelText = useCallback(() => setTextInput(null), []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1]!;
    setRedoStack((r) => [...r, annotations]);
    setAnnotations(prev);
    setUndoStack((u) => u.slice(0, -1));
  }, [undoStack, annotations]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1]!;
    setUndoStack((u) => [...u, annotations]);
    setAnnotations(next);
    setRedoStack((r) => r.slice(0, -1));
  }, [redoStack, annotations]);

  const clear = useCallback(() => {
    if (annotations.length === 0) return;
    commit([]);
  }, [annotations, commit]);

  return {
    tool,
    color,
    strokeWidth,
    annotations,
    activeAnnotation,
    textInput,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    setTool,
    setColor,
    setStrokeWidth,
    startDraw,
    continueDraw,
    endDraw,
    cancelDraw,
    updateTextValue,
    commitText,
    cancelText,
    undo,
    redo,
    clear,
  };
}
