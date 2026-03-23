

export const scoringElements = [
  {
    id: '1', number: 1, name: 'Near Miss Reporting Rate & Follow-up', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
      { id: '1a', description: 'Reporting of Near miss min 1 / plant / month', benchmark: 'Min 1 / month', maxMarks: 1.5, active: true },
      { id: '1b', description: 'Reporting of unsafe conditions min 2 / plant / month', benchmark: 'Min 2 / month', maxMarks: 1.5, active: true },
      { id: '1c', description: 'NM, UA and UC observations closing % for the month >= 80%', benchmark: '≥80%', maxMarks: 2, active: true },
      { id: '1d', description: 'Improving trend for reporting NM, UA, UC', benchmark: 'Improving trend', maxMarks: 2.5, active: true },
      { id: '1e', description: 'Improving trend of compliance % of recommendations', benchmark: 'Improving trend', maxMarks: 2.5, active: true },
    ]
  },
  {
    id: '2', number: 2, name: 'Safety Training Completion Rate & Effectiveness', maxMarks: 15, type: 'Leading', weightage: 15, active: true, subElements: [
      { id: '2a', description: 'Two trainings to be completed as per TNI & effectiveness logic', benchmark: '2 trainings/month', maxMarks: 2.5, active: true },
      { id: '2b', description: 'Additional trainings to enhance knowledge (two samples/month)', benchmark: '2 samples/month', maxMarks: 2.5, active: true },
      { id: '2c', description: 'Application of training knowledge during audits', benchmark: 'Highlighted in audits', maxMarks: 2.5, active: true },
      { id: '2d', description: 'No deviations for SOP, WI, HIRA, PTW, Lifting plan, IOS', benchmark: 'No deviations', maxMarks: 2.5, active: true },
      { id: '2e', description: 'Min 2 HIRA prepared/updated per month', benchmark: '2/month', maxMarks: 1.5, active: true },
      { id: '2f', description: 'Availability of HIRA for all activities', benchmark: '100% availability', maxMarks: 1.5, active: true },
      { id: '2g', description: 'No deviations during safety audits/inspections', benchmark: 'No deviations', maxMarks: 2, active: true },
    ]
  },
  {
    id: '3', number: 3, name: 'Completion Rate of Planned Safety Inspections / Audits', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
      { id: '3a', description: 'Two monthly workplace inspections & 4-5 obs per inspection', benchmark: '2 inspections/month', maxMarks: 2.5, active: true },
      { id: '3b', description: 'Comply observations (unsafe acts/conditions/near misses) min 80% per month', benchmark: '≥80%', maxMarks: 2.5, active: true },
      { id: '3c', description: 'Recommendations compliance min 80% for internal assessments (PTW, LOTO, WAH)', benchmark: '≥80%', maxMarks: 2.5, active: true },
      { id: '3d', description: 'Min 80% score maintained for internal assessments/audits', benchmark: '≥80%', maxMarks: 2.5, active: true },
    ]
  },
  {
    id: '4', number: 4, name: 'Adherence to LOTO, PTW and other Procedures', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
      { id: '4a', description: 'LOTO implementation without deviation every month', benchmark: 'Without deviation', maxMarks: 5, active: true },
      { id: '4b', description: 'PTW implementation without deviation every month', benchmark: 'Without deviation', maxMarks: 5, active: true },
    ]
  },
  {
    id: '5', number: 5, name: 'Demonstrated Leadership Commitment & Safety Culture', maxMarks: 25, type: 'Lagging', weightage: 25, active: true, subElements: [
      { id: '5a', description: 'Comply all roles of DSO via IOS scorecard per month', benchmark: 'IOS scorecard submission', maxMarks: 10, active: true },
      { id: '5b', description: 'Safety Committee Meeting Minutes shared & published', benchmark: 'MOM shared', maxMarks: 2.5, active: true },
      { id: '5c', description: 'Zero Harm drive & internal assessment', benchmark: 'Assessment of PTW/LOTO/WAH', maxMarks: 2.5, active: true },
      { id: '5d', description: 'Maintain IOS scorecard at min 80% & improving trend', benchmark: '≥80%', maxMarks: 2.5, active: true },
      { id: '5e', description: 'Fulfilling MBD dash, 5 step HIRA process', benchmark: 'Implementation ground level', maxMarks: 2.5, active: true },
      { id: '5f', description: 'Attend min 1 safety committee meeting, mock drill, inspection, assessment', benchmark: 'Min 1 attendance', maxMarks: 2.5, active: true },
      { id: '5g', description: 'Implementation of CMCP by submitting evidences', benchmark: 'Evidences submitted', maxMarks: 2.5, active: true },
    ]
  },
  {
    id: '6', number: 6, name: 'Element Ownership & Accountability', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
      { id: '6a', description: 'Element owner assignment', benchmark: 'All elements assigned', maxMarks: 5, active: true },
      { id: '6b', description: 'Progress tracking adherence', benchmark: 'Weekly updates provided', maxMarks: 5, active: true },
    ]
  },
  {
    id: '7', number: 7, name: 'Adoption of Best Practices & Continuous Improvement', maxMarks: 10, type: 'Leading', weightage: 10, active: true, subElements: [
      { id: '7a', description: 'Every month one new initiative from DSO, EO, Zonal, Sub-zonal and Cluster in-charge per month.', benchmark: '1 initiative/month', maxMarks: 5, active: true },
      { id: '7b', description: 'Every month appreciation to DSO, EO and other for their contribution and support safety culture from cluster / zonal / sub-zonal in-charge.', benchmark: 'Monthly appreciation', maxMarks: 2.5, active: true },
      { id: '7c', description: 'Adopting of new technology based on the update from National and International forums.', benchmark: 'Technology adoption', maxMarks: 2.5, active: true },
    ]
  },
  {
    id: '8', number: 8, name: 'Compliance & Readiness', maxMarks: 10, type: 'Lagging', weightage: 10, active: true, subElements: [
      { id: '8a', description: 'Legal register compliance and sharing of report once in month', benchmark: 'Report shared', maxMarks: 5, active: true },
      { id: '8b', description: 'Implementation of OHS procedures (PSSR, MOC, HIRA)', benchmark: 'Procedures implemented', maxMarks: 5, active: true },
    ]
  },
  {
    id: '9', number: 9, name: 'Negative grades: accident due to negligence', maxMarks: -50, type: 'Lagging', weightage: 0, active: true, subElements: [
      { id: '9a', description: 'First Aid Cases and Oil Spills', benchmark: '-4 per incident', maxMarks: -4, active: true },
      { id: '9b', description: 'Medical Treatment Cases and Property damage (<2 lac)', benchmark: '-8 per incident', maxMarks: -8, active: true },
      { id: '9c', description: 'Lost Time Injury and Property damage (2 to 10 lac)', benchmark: '-15 per incident', maxMarks: -15, active: true },
      { id: '9d', description: 'Fatality or Property damage (>10 lac)', benchmark: '-50 per incident', maxMarks: -50, active: true },
    ]
  },
];
