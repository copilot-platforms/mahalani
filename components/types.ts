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

export type Task = {
  id?: string;
  title: string;
  status: TaskStatus;
  assignee?: ClientDataType;
  priority?: Priority;
  description?: string;
};

export type ClientDataType = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
};

export enum TodoListViewMode {
  Board = 'board',
  List = 'list',
}
