

export const quizzes = [
  {
    id: '1', title: 'Safety Training Assessment Q3', type: 'MCQ',
    element: 'Safety Training Completion', targetRole: 'SITE_HEAD',
    timeLimit: 30, passingScore: 70,
    description: 'Quarterly safety knowledge assessment covering PPE usage, emergency procedures, and hazard identification.',
    status: 'Published', assignedSites: ['Kurnool Solar Plant', 'Anantapur Wind Farm'],
    startDate: '2026-03-01', endDate: '2026-03-31', createdBy: 'Priya Mehta',
    questions: [
      { id: 'q1', text: 'What is the first step in the LOTO procedure?', type: 'single', marks: 5, options: [
        { id: 'a', text: 'Notify affected employees', correct: true },
        { id: 'b', text: 'Apply the lock', correct: false },
        { id: 'c', text: 'Remove the lock', correct: false },
        { id: 'd', text: 'Test the equipment', correct: false },
      ]},
      { id: 'q2', text: 'Which PPE is mandatory in the solar panel area?', type: 'single', marks: 5, options: [
        { id: 'a', text: 'Safety goggles only', correct: false },
        { id: 'b', text: 'Hard hat, safety shoes, and gloves', correct: true },
        { id: 'c', text: 'Just safety shoes', correct: false },
        { id: 'd', text: 'No PPE required', correct: false },
      ]},
      { id: 'q3', text: 'What should you do if you discover a gas leak?', type: 'single', marks: 5, options: [
        { id: 'a', text: 'Ignore it if small', correct: false },
        { id: 'b', text: 'Evacuate and alert the emergency team', correct: true },
        { id: 'c', text: 'Try to fix it yourself', correct: false },
        { id: 'd', text: 'Continue working', correct: false },
      ]},
      { id: 'q4', text: 'How often should fire extinguishers be inspected?', type: 'single', marks: 5, options: [
        { id: 'a', text: 'Annually', correct: false },
        { id: 'b', text: 'Monthly', correct: true },
        { id: 'c', text: 'Weekly', correct: false },
        { id: 'd', text: 'Only when used', correct: false },
      ]},
      { id: 'q5', text: 'Select all valid types of safety permits:', type: 'multiple', marks: 10, options: [
        { id: 'a', text: 'Hot Work Permit', correct: true },
        { id: 'b', text: 'Confined Space Entry Permit', correct: true },
        { id: 'c', text: 'Lunch Break Permit', correct: false },
        { id: 'd', text: 'Working at Height Permit', correct: true },
      ]},
    ],
    checklist: [],
  },
  {
    id: '2', title: 'Practical Safety Walkthrough', type: 'Practical',
    element: 'Leadership Commitment', targetRole: 'SITE_HEAD',
    timeLimit: null, passingScore: 60,
    description: 'On-site practical evaluation of safety practices.',
    status: 'Published', assignedSites: ['Kurnool Solar Plant'],
    startDate: '2026-03-05', endDate: '2026-03-20', createdBy: 'Priya Mehta',
    questions: [],
    checklist: [
      { id: 'cl1', description: 'All fire exits clearly marked and unobstructed', marks: 10, evidenceRequired: true },
      { id: 'cl2', description: 'PPE compliance observed across site', marks: 15, evidenceRequired: true },
      { id: 'cl3', description: 'Safety signage in local language displayed', marks: 10, evidenceRequired: false },
      { id: 'cl4', description: 'First aid kits stocked and accessible', marks: 10, evidenceRequired: true },
      { id: 'cl5', description: 'Housekeeping standards maintained', marks: 5, evidenceRequired: false },
    ],
  },
  {
    id: '3', title: 'Near Miss Awareness Quiz', type: 'MCQ',
    element: 'Near Miss Reporting', targetRole: 'All',
    timeLimit: 15, passingScore: 80,
    description: 'Quick assessment on near miss identification and reporting.',
    status: 'Draft', assignedSites: [], startDate: '', endDate: '', createdBy: 'Priya Mehta',
    questions: [
      { id: 'q6', text: 'What is a near miss?', type: 'single', marks: 10, options: [
        { id: 'a', text: 'An accident that caused injury', correct: false },
        { id: 'b', text: 'An event that could have caused injury but did not', correct: true },
        { id: 'c', text: 'A planned safety drill', correct: false },
        { id: 'd', text: 'A maintenance request', correct: false },
      ]},
    ],
    checklist: [],
  },
];
