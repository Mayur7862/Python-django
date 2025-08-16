import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query {
    projects {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTasks
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation ($name: String!, $description: String, $status: String, $dueDate: Date) {
    createProject(name: $name, description: $description, status: $status, due_date: $dueDate) {
      project { id name description status dueDate taskCount completedTasks }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation ($id: ID!, $name: String, $description: String, $status: String, $dueDate: Date) {
    updateProject(id: $id, name: $name, description: $description, status: $status, due_date: $dueDate) {
      project { id name description status dueDate taskCount completedTasks }
    }
  }
`;

export const GET_TASKS = gql`
  query ($projectId: ID!) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation (
    $projectId: ID!
    $title: String!
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      assignee_email: $assigneeEmail
      due_date: $dueDate
    ) {
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        comments { id content authorEmail createdAt }
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation (
    $id: ID!
    $title: String
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      assignee_email: $assigneeEmail
      due_date: $dueDate
    ) {
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        comments { id content authorEmail createdAt }
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation ($id: ID!) {
    deleteTask(id: $id) {
      ok
      deletedId
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation ($taskId: ID!, $content: String!, $authorEmail: String!) {
    addTaskComment(task_id: $taskId, content: $content, author_email: $authorEmail) {
      taskComment {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;
