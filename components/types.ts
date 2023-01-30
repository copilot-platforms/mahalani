export enum TaskStatus {
  Todo = 'TODO',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
}

export type Task = {
  title: string;
  description: string;
  status: TaskStatus;
  assigneeProfilePicture: string;
};
