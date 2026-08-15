import { describe, expect, it } from "vitest";
import { generateInstructorChangeLetter } from "./generateInstructorChangeLetter";

describe("generateInstructorChangeLetter", () => {
  it("includes both instructor names when both are given (lv)", () => {
    const letter = generateInstructorChangeLetter({
      studentName: "Anna Bērziņa",
      schoolName: "Autoskola Saule",
      currentInstructor: "Jānis Ozols",
      newInstructor: "Pēteris Kalns",
      date: "2026-08-15",
      lang: "lv",
    });
    expect(letter).toContain("Anna Bērziņa");
    expect(letter).toContain("Autoskola Saule");
    expect(letter).toContain("no instruktora Jānis Ozols");
    expect(letter).toContain("uz instruktoru Pēteris Kalns");
    expect(letter).toContain("2026-08-15");
  });

  it("falls back to 'pēc autoskolas ieteikuma' when new instructor is blank (lv)", () => {
    const letter = generateInstructorChangeLetter({
      studentName: "Anna Bērziņa",
      schoolName: "Autoskola Saule",
      currentInstructor: "Jānis Ozols",
      newInstructor: "",
      date: "2026-08-15",
      lang: "lv",
    });
    expect(letter).toContain("uz citu instruktoru pēc autoskolas ieteikuma");
    expect(letter).not.toContain("uz instruktoru ");
  });

  it("omits the 'no instruktora' clause when current instructor is blank (lv)", () => {
    const letter = generateInstructorChangeLetter({
      studentName: "Anna Bērziņa",
      schoolName: "Autoskola Saule",
      currentInstructor: "",
      newInstructor: "Pēteris Kalns",
      date: "2026-08-15",
      lang: "lv",
    });
    expect(letter).not.toContain("no instruktora");
    expect(letter).toContain("uz instruktoru Pēteris Kalns");
  });

  it("uses placeholders when student/school name are blank (lv)", () => {
    const letter = generateInstructorChangeLetter({
      studentName: "",
      schoolName: "",
      date: "2026-08-15",
      lang: "lv",
    });
    expect(letter).toContain("[vārds, uzvārds]");
    expect(letter).toContain("[autoskolas nosaukums]");
  });

  it("renders the ru template with both instructor names", () => {
    const letter = generateInstructorChangeLetter({
      studentName: "Анна Берзиня",
      schoolName: "Автошкола Сауле",
      currentInstructor: "Янис Озолс",
      newInstructor: "Петерис Калнс",
      date: "2026-08-15",
      lang: "ru",
    });
    expect(letter).toContain("Анна Берзиня");
    expect(letter).toContain("Автошкола Сауле");
    expect(letter).toContain("от инструктора Янис Озолс");
    expect(letter).toContain("на инструктора Петерис Калнс");
  });

  it("falls back to 'по усмотрению автошколы' when new instructor is blank (ru)", () => {
    const letter = generateInstructorChangeLetter({
      studentName: "Анна Берзиня",
      schoolName: "Автошкола Сауле",
      newInstructor: "",
      date: "2026-08-15",
      lang: "ru",
    });
    expect(letter).toContain("на другого инструктора по усмотрению автошколы");
  });
});
