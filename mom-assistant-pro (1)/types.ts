
export interface ActionItem {
  task: string;
  owner: string;
  deadline?: string;
}

export interface MOMResult {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  nextSteps: string[];
  rawTranscript?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
