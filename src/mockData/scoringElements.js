

export const scoringElements = [
  { id: '1', number: 1, name: 'Near Miss Reporting Rate & Follow-up', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
    { id: '1a', description: 'Near miss reporting rate per month', benchmark: '≥5 reports/month', maxMarks: 5, active: true },
    { id: '1b', description: 'Follow-up closure rate', benchmark: '≥90% closed within 7 days', maxMarks: 5, active: true },
  ]},
  { id: '2', number: 2, name: 'Safety Training Completion Rate & Effectiveness', maxMarks: 15, type: 'Leading', weightage: 15, active: true, subElements: [
    { id: '2a', description: 'Training completion percentage', benchmark: '100% completion', maxMarks: 5, active: true },
    { id: '2b', description: 'Training effectiveness score', benchmark: '≥80% pass rate in quiz', maxMarks: 5, active: true },
    { id: '2c', description: 'Toolbox talks conducted', benchmark: '≥4 per month', maxMarks: 5, active: true },
  ]},
  { id: '3', number: 3, name: 'Completion Rate of Planned Safety Inspections/Audits', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
    { id: '3a', description: 'Inspection completion %', benchmark: '100% of planned inspections', maxMarks: 5, active: true },
    { id: '3b', description: 'Audit finding closure rate', benchmark: '≥85% findings closed', maxMarks: 5, active: true },
  ]},
  { id: '4', number: 4, name: 'Adherence to LOTO, PTW and other Procedures', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
    { id: '4a', description: 'PTW compliance rate', benchmark: '100% compliance', maxMarks: 5, active: true },
    { id: '4b', description: 'LOTO procedure adherence', benchmark: 'Zero violations', maxMarks: 5, active: true },
  ]},
  { id: '5', number: 5, name: 'Demonstrated Leadership Commitment & Safety Culture', maxMarks: 25, type: 'Lagging', weightage: 25, active: true, subElements: [
    { id: '5a', description: 'Management safety walks', benchmark: '≥2 walks/month by site head', maxMarks: 10, active: true },
    { id: '5b', description: 'Safety committee meetings', benchmark: 'Monthly meetings held', maxMarks: 5, active: true },
    { id: '5c', description: 'Employee safety engagement', benchmark: '≥80% participation', maxMarks: 10, active: true },
  ]},
  { id: '6', number: 6, name: 'Element Ownership & Accountability', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
    { id: '6a', description: 'Element owner assignment', benchmark: 'All elements assigned', maxMarks: 5, active: true },
    { id: '6b', description: 'Progress tracking adherence', benchmark: 'Weekly updates provided', maxMarks: 5, active: true },
  ]},
  { id: '7', number: 7, name: 'Adoption of Best Practices & Continuous Improvement', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
    { id: '7a', description: 'Best practices implemented', benchmark: '≥2 new practices/quarter', maxMarks: 5, active: true },
    { id: '7b', description: 'Improvement suggestions acted on', benchmark: '≥50% acted upon', maxMarks: 5, active: true },
  ]},
  { id: '8', number: 8, name: 'Compliance & Readiness', maxMarks: 10, type: 'Lagging', weightage: 10, active: true, subElements: [
    { id: '8a', description: 'Legal compliance status', benchmark: '100% compliant', maxMarks: 5, active: true },
    { id: '8b', description: 'Emergency preparedness drills', benchmark: '≥1 drill/quarter', maxMarks: 5, active: true },
  ]},
  { id: '9', number: 9, name: 'Negative Grades: Accidents due to Negligence', maxMarks: -50, type: 'Lagging', weightage: 0, active: true, subElements: [
    { id: '9a', description: 'First Aid Case', benchmark: '-2 per incident', maxMarks: -2, active: true },
    { id: '9b', description: 'Medical Treatment Case', benchmark: '-5 per incident', maxMarks: -5, active: true },
    { id: '9c', description: 'Lost Time Injury', benchmark: '-15 per incident', maxMarks: -15, active: true },
    { id: '9d', description: 'Fatality', benchmark: '-50 per incident', maxMarks: -50, active: true },
  ]},
];
