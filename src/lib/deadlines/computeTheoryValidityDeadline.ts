/*
 * computeTheoryValidityDeadline — формула из docs/06-tools/ekran-ne-sdal.md.
 * "Теория действует 1 год с даты сдачи."
 */
export function computeTheoryValidityDeadline(theoryExamDate: Date): Date {
  const result = new Date(theoryExamDate);
  result.setFullYear(result.getFullYear() + 1);
  return result;
}
