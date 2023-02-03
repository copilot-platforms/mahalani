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
}

export type Task = {
  id?: string;
  title: string;
  status: TaskStatus;
  assignee?: AssigneeDataType;
  priority?: Priority;
  description?: string;
  attachments?: AirTableAttachment[] | null;
  learnMoreLink?: string | null;
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
