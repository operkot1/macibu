export interface InstructorChangeLetterInput {
  studentName: string;
  schoolName: string;
  currentInstructor?: string;
  newInstructor?: string;
  date: string;
  lang: "lv" | "ru";
}

export function generateInstructorChangeLetter(
  input: InstructorChangeLetterInput,
): string {
  const studentName = input.studentName.trim();
  const schoolName = input.schoolName.trim();
  const currentInstructor = input.currentInstructor?.trim() ?? "";
  const newInstructor = input.newInstructor?.trim() ?? "";

  if (input.lang === "lv") {
    const from = currentInstructor
      ? ` no instruktora ${currentInstructor}`
      : "";
    const to = newInstructor
      ? `uz instruktoru ${newInstructor}`
      : "uz citu instruktoru pēc autoskolas ieteikuma";
    return [
      input.date,
      "",
      schoolName || "[autoskolas nosaukums]",
      "",
      "Iesniegums",
      "",
      `Es, ${studentName || "[vārds, uzvārds]"}, lūdzu mainīt manu braukšanas instruktoru${from} ${to}.`,
      "",
      "Paraksts: _______________",
      studentName || "[vārds, uzvārds]",
    ].join("\n");
  }

  const from = currentInstructor ? ` от инструктора ${currentInstructor}` : "";
  const to = newInstructor
    ? `на инструктора ${newInstructor}`
    : "на другого инструктора по усмотрению автошколы";
  return [
    input.date,
    "",
    schoolName || "[название автошколы]",
    "",
    "Заявление",
    "",
    `Я, ${studentName || "[фамилия, имя]"}, прошу сменить моего инструктора по вождению${from} ${to}.`,
    "",
    "Подпись: _______________",
    studentName || "[фамилия, имя]",
  ].join("\n");
}
