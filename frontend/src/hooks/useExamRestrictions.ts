import { useEffect } from "react";

interface ExamRestrictionHandlers {
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onContextMenu?: () => void;
}

export function useExamRestrictions(enabled: boolean, handlers: ExamRestrictionHandlers) {
  useEffect(() => {
    if (!enabled) return;

    function block(event: Event, callback?: () => void) {
      event.preventDefault();
      callback?.();
    }

    const onCopy = (event: ClipboardEvent) => block(event, handlers.onCopy);
    const onPaste = (event: ClipboardEvent) => block(event, handlers.onPaste);
    const onCut = (event: ClipboardEvent) => block(event, handlers.onCut);
    const onContextMenu = (event: MouseEvent) => block(event, handlers.onContextMenu);

    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [enabled, handlers]);
}
