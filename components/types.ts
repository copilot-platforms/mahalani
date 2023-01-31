export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'In progress',
  Done = 'Done',
}

export type Task = {
  id?: string;
  title: string;
  status: TaskStatus;
  assignee?: ClientDataType;
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
