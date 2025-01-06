export const grade_points: { [key: string]: number } = {
  O: 91,
  "A+": 81,
  A: 71,
  "B+": 61,
  B: 56,
  C: 50,
};

export function getGrade(marks: number): string {
  if (marks >= 91) return "O";
  if (marks >= 81) return "A+";
  if (marks >= 71) return "A";
  if (marks >= 61) return "B+";
  if (marks >= 56) return "B";
  if (marks >= 50) return "C";
  return "F";
}
