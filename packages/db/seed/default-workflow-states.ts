export const defaultWorkflowStates = [
  {
    id: 'ws-backlog',
    name: 'Backlog',
    type: 'backlog' as const,
    color: '#95999f',
    position: 0,
  },
  {
    id: 'ws-todo',
    name: 'Todo',
    type: 'unstarted' as const,
    color: '#e2e2e2',
    position: 1,
  },
  {
    id: 'ws-in-progress',
    name: 'In Progress',
    type: 'started' as const,
    color: '#f2c94c',
    position: 2,
  },
  {
    id: 'ws-in-review',
    name: 'In Review',
    type: 'in_review' as const,
    color: '#4cb782',
    position: 3,
  },
  {
    id: 'ws-done',
    name: 'Done',
    type: 'completed' as const,
    color: '#5e6ad2',
    position: 4,
  },
  {
    id: 'ws-canceled',
    name: 'Canceled',
    type: 'canceled' as const,
    color: '#95999f',
    position: 5,
  },
]
