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
    position: 0,
  },
  {
    id: 'ws-in-progress',
    name: 'In Progress',
    type: 'started' as const,
    color: '#f2c94c',
    position: 0,
  },
  {
    id: 'ws-done',
    name: 'Done',
    type: 'completed' as const,
    color: '#4cb782',
    position: 0,
  },
  {
    id: 'ws-canceled',
    name: 'Canceled',
    type: 'canceled' as const,
    color: '#95999f',
    position: 0,
  },
]
