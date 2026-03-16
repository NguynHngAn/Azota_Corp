import { createContext, useContext, useState, type ReactNode, useMemo } from "react";

interface ExamState {
  inProgress: boolean;
  assignmentId: number | null;
  submissionId: number | null;
}

interface ExamContextValue extends ExamState {
  startExam: (payload: { assignmentId: number; submissionId: number }) => void;
  finishExam: () => void;
}

const ExamContext = createContext<ExamContextValue | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExamState>({
    inProgress: false,
    assignmentId: null,
    submissionId: null,
  });

  const startExam = (payload: { assignmentId: number; submissionId: number }) => {
    setState({
      inProgress: true,
      assignmentId: payload.assignmentId,
      submissionId: payload.submissionId,
    });
  };

  const finishExam = () => {
    setState({
      inProgress: false,
      assignmentId: null,
      submissionId: null,
    });
  };

  const value: ExamContextValue = useMemo(
    () => ({
      ...state,
      startExam,
      finishExam,
    }),
    [state],
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam(): ExamContextValue {
  const ctx = useContext(ExamContext);
  if (!ctx) {
    throw new Error("useExam must be used within ExamProvider");
  }
  return ctx;
}

