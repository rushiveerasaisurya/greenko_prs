

export const tickets = [
  {
    id: '1', ticketId: 'NM-2026-0041', type: 'NM', title: 'Oil spill near transformer bay',
    description: 'Minor oil leak observed near the main transformer during routine patrol. Oil pool approximately 30cm diameter.',
    location: 'Transformer Bay - Section A', reportedBy: 'Arun Kumar', site: 'Kurnool Solar Plant',
    cluster: 'South Cluster', date: '2026-03-06 09:30', status: 'OPEN', priority: 'Medium',
    immediateAction: 'Area cordoned off with caution tape. Absorbent pads placed.',
    assignedTo: 'Priya Mehta', correctiveActions: [],
    comments: [{ id: 'c1', by: 'Arun Kumar', text: 'Spill contained. Awaiting maintenance team.', timestamp: '2026-03-06 09:45' }]
  },
  {
    id: '2', ticketId: 'UA-2026-0012', type: 'UA', title: 'Worker without harness at height',
    description: 'Observed a contract worker on scaffolding at 6m height without safety harness.',
    location: 'Block 3 - Panel Row 12', reportedBy: 'Vijay Singh', site: 'Anantapur Wind Farm',
    cluster: 'South Cluster', date: '2026-03-05 14:15', status: 'IN_PROGRESS', priority: 'High',
    immediateAction: 'Worker brought down immediately. Work stopped for safety briefing.',
    assignedTo: 'Priya Mehta',
    correctiveActions: [
      { id: 'ca1', action: 'Re-train contractor crew on harness usage', assignedTo: 'DSO', dueDate: '2026-03-10', done: false },
      { id: 'ca2', action: 'Issue warning letter to contractor', assignedTo: 'Site Head', dueDate: '2026-03-08', done: true },
    ],
    comments: [{ id: 'c2', by: 'Priya Mehta', text: 'Warning letter issued. Training scheduled for March 10.', timestamp: '2026-03-06 10:00' }]
  },
  {
    id: '3', ticketId: 'UC-2026-0019', type: 'UC', title: 'Broken handrail on staircase',
    description: 'Handrail on the control room staircase is loose and partially detached.',
    location: 'Control Room Building', reportedBy: 'Sunita Patil', site: 'Kutch Wind Farm',
    cluster: 'West Cluster', date: '2026-03-04 11:00', status: 'CLOSED', priority: 'Medium',
    immediateAction: 'Temporary barricade placed.',
    assignedTo: 'Deepa Rao',
    correctiveActions: [{ id: 'ca3', action: 'Repair handrail', assignedTo: 'Maintenance Team', dueDate: '2026-03-06', done: true }],
    comments: [{ id: 'c3', by: 'Deepa Rao', text: 'Handrail repaired and inspected.', timestamp: '2026-03-06 16:00' }],
    closedDate: '2026-03-06 16:30', closedBy: 'Deepa Rao'
  },
  {
    id: '4', ticketId: 'NM-2026-0042', type: 'NM', title: 'Loose cable on walkway',
    description: 'Unsecured cable running across the main walkway creating a tripping hazard.',
    location: 'Main Walkway - Area B', reportedBy: 'Arun Kumar', site: 'Kurnool Solar Plant',
    cluster: 'South Cluster', date: '2026-03-07 08:00', status: 'OPEN', priority: 'Low',
    immediateAction: 'Cable temporarily rerouted and taped down.',
    assignedTo: 'Priya Mehta', correctiveActions: [], comments: []
  },
  {
    id: '5', ticketId: 'UA-2026-0013', type: 'UA', title: 'Forklift operated without certification',
    description: 'Uncertified operator found driving forklift in material storage area.',
    location: 'Material Storage Yard', reportedBy: 'Vijay Singh', site: 'Anantapur Wind Farm',
    cluster: 'South Cluster', date: '2026-03-03 15:30', status: 'CLOSED', priority: 'Critical',
    immediateAction: 'Operator removed from duty immediately.',
    assignedTo: 'Priya Mehta',
    correctiveActions: [
      { id: 'ca4', action: 'Revoke operator access pending certification', assignedTo: 'HR', dueDate: '2026-03-04', done: true },
      { id: 'ca5', action: 'Conduct forklift safety awareness', assignedTo: 'DSO', dueDate: '2026-03-07', done: true },
    ],
    comments: [{ id: 'c4', by: 'Priya Mehta', text: 'All corrective actions completed.', timestamp: '2026-03-07 12:00' }],
    closedDate: '2026-03-07 12:15', closedBy: 'Priya Mehta'
  },
  {
    id: '6', ticketId: 'NM-2026-0043', type: 'NM', title: 'Sparking at junction box',
    description: 'Minor sparking noticed at the DC junction box during morning inspection.',
    location: 'DC Junction Box JB-17', reportedBy: 'Arun Kumar', site: 'Kurnool Solar Plant',
    cluster: 'South Cluster', date: '2026-03-08 07:45', status: 'OPEN', priority: 'High',
    immediateAction: 'Power isolated to JB-17. Electrician called.',
    assignedTo: 'Priya Mehta', correctiveActions: [], comments: []
  },
];
