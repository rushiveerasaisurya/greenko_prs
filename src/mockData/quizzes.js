export const quizzes = [
  {
    id: '1', title: 'Safety Training Assessment Q3', type: 'MCQ',
    element: 'Safety Training Completion', targetRole: 'SITE_HEAD',
    timeLimit: 30, passingScore: 70,
    description: 'Quarterly safety knowledge assessment covering PPE usage, emergency procedures, and hazard identification.',
    status: 'Published', assignedSites: ['Kurnool Solar Plant', 'Anantapur Wind Farm'],
    startDate: '2026-03-01', endDate: '2026-03-31', createdBy: 'Priya Mehta',
    questions: [
      {
        id: 'q1', text: 'What is the first step in the LOTO procedure?', type: 'single', marks: 5, options: [
          { id: 'a', text: 'Notify affected employees', correct: true },
          { id: 'b', text: 'Apply the lock', correct: false },
          { id: 'c', text: 'Remove the lock', correct: false },
          { id: 'd', text: 'Test the equipment', correct: false },
        ]
      },
    ],
    checklist: [],
  },
];
