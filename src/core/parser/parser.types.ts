export interface Job {
  key: string;
  name?: string;
  steps: Command[];
}

export interface Command {
  cmd: keyof typeof CommandType;
  args: string[];
}

export enum CommandType {
  COPY = 'COPY',
  RUN = 'RUN',
  WORKDIR = 'WORKDIR',
  MERGE_JSON = 'MERGE_JSON'
}

export type MatronDocumentJobStep = { [key in CommandType]?: string };
export interface MatronDocumentJob {
  name?: string;
  steps: MatronDocumentJobStep[];
}
export type MatronDocumentJobs = { [key: string]: MatronDocumentJob };
export interface MatronDocument {
  jobs: MatronDocumentJobs;
}
