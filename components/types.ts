export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'In progress',
  Done = 'Done',
}
export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

type AirTableAttachment = {
  type: string;
  url: string;
};

export type Task = {
  id?: string;
  title: string;
  status: TaskStatus;
  assignee?: AssigneeDataType;
  priority?: Priority;
  rank: number;
  description?: string;
  attachments?: AirTableAttachment[] | null;
  learnMoreLink?: string | null;
  clientIdRef?: string; // This is used to link the task to the client in the database
};

export type AssigneeDataType = {
  id: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  name?: string;
  avatarImageURL?: string;
  fallbackColor?: string;
};

export enum TodoListViewMode {
  Board = 'board',
  List = 'list',
}
