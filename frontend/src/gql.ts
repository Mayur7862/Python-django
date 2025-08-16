import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query {
    projects { id name description status dueDate taskCount completedTasks }
  }
`;

export const CREATE_PROJECT = gql`
  mutation($name: String!, $description: String, $status: String, $dueDate: Date) {
    createProject(name: $name, description: $description, status: $status, dueDate: $dueDate) {
      project { id name description status dueDate taskCount completedTasks }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation($id: ID!, $name: String, $description: String, $status: String, $dueDate: Date) {
    updateProject(id: $id, name: $name, description: $description, status: $status, dueDate: $dueDate) {
      project { id name description status dueDate taskCount completedTasks }
    }
  }
`;

export const GET_TASKS = gql`
  query($projectId: ID!) {
    tasks(projectId: $projectId) {
      id title description status assigneeEmail dueDate
    }
  }
`;

export const CREATE_TASK = gql`
  mutation($projectId: ID!, $title: String!, $description: String, $status: String, $assigneeEmail: String, $dueDate: DateTime) {
    createTask(projectId: $projectId, title: $title, description: $description, status: $status, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      task { id title description status assigneeEmail dueDate }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation($id: ID!, $title: String, $description: String, $status: String, $assigneeEmail: String, $dueDate: DateTime) {
    updateTask(id: $id, title: $title, description: $description, status: $status, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      task { id title description status assigneeEmail dueDate }
    }
  }
`;

export const ADD_TASK_COMMENT = gql`
  mutation($taskId: ID!, $content: String!, $authorEmail: String!) {
    addTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      comment { id content authorEmail createdAt }
    }
  }
`;
