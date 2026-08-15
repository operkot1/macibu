import { useEffect, useMemo, useState } from "react";
import { generateInstructorChangeLetter } from "../../../lib/instruktors/generateInstructorChangeLetter";
import { trackEvent } from "../../../lib/analytics/trackEvent";

export interface InstructorChangeLetterFormProps {
  currentLocale: "lv" | "ru";
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const text = {
  lv: {
    studentNameLabel: "Tavs vārds, uzvārds",
    schoolNameLabel: "Autoskolas nosaukums",
    currentInstructorLabel: "Pašreizējais instruktors (nav obligāts)",
    newInstructorLabel: "Vēlamais instruktors (nav obligāts)",
    dateLabel: "Datums",
    resultHeading: "Iesnieguma teksts",
    copy: "Kopēt",
    copied: "Nokopēts!",
  },
  ru: {
    studentNameLabel: "Твоё имя, фамилия",
    schoolNameLabel: "Название автошколы",
    currentInstructorLabel: "Текущий инструктор (необязательно)",
    newInstructorLabel: "Желаемый инструктор (необязательно)",
    dateLabel: "Дата",
    resultHeading: "Текст заявления",
    copy: "Скопировать",
    copied: "Скопировано!",
  },
} as const;

function textField(
  label: string,
  value: string,
  onChange: (v: string) => void,
  type: "text" | "date" = "text",
) {
  return (
    <div>
      <label className="text-body-sm text-neutral-600 mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
      />
    </div>
  );
}

export default function InstructorChangeLetterForm({
  currentLocale,
}: InstructorChangeLetterFormProps) {
  const t = text[currentLocale];
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [currentInstructor, setCurrentInstructor] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [copied, setCopied] = useState(false);

  useEffect(() => trackEvent("instructor_change_letter_viewed"), []);

  const letter = useMemo(
    () =>
      generateInstructorChangeLetter({
        studentName,
        schoolName,
        currentInstructor,
        newInstructor,
        date,
        lang: currentLocale,
      }),
    [
      studentName,
      schoolName,
      currentInstructor,
      newInstructor,
      date,
      currentLocale,
    ],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      trackEvent("instructor_change_letter_copied");
    } catch {
      // Clipboard API недоступен/отклонён — teksts joprojām redzams un
      // izvēlams manuāli readonly laukā zemāk (tas pats risinājums, kas
      // SavePathButton, T-031).
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {textField(t.studentNameLabel, studentName, setStudentName)}
        {textField(t.schoolNameLabel, schoolName, setSchoolName)}
        {textField(
          t.currentInstructorLabel,
          currentInstructor,
          setCurrentInstructor,
        )}
        {textField(t.newInstructorLabel, newInstructor, setNewInstructor)}
        {textField(t.dateLabel, date, setDate, "date")}
      </div>

      <p className="text-body-sm text-neutral-600 mb-1">{t.resultHeading}</p>
      <textarea
        readOnly
        value={letter}
        rows={10}
        onFocus={(e) => e.currentTarget.select()}
        className="text-body-sm mb-2 w-full rounded-md border border-neutral-300 p-3 font-mono"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="text-body-sm border-neutral-300 rounded-md border p-2 px-4 hover:bg-neutral-100"
      >
        {copied ? t.copied : t.copy}
      </button>
    </div>
  );
}
