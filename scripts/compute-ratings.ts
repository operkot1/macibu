import { writeFileSync } from "node:fs";
import path from "node:path";
import { getSchools, getInstructors } from "../src/lib/data";
import { computeRatings } from "../src/lib/ratings/computeRatings";
import type { RatingsFile } from "../src/types/data";

/*
 * ETL: schools.json + instructors.json → ratings.json (docs/03-data-model.md
 * §4). Единственный способ получить/обновить этот файл — ratings не
 * вводится вручную никем (owner — этот скрипт, не человек).
 */

const METHODOLOGY_VERSION = "1.0.0";

const schools = getSchools();
const instructors = getInstructors();
const calculatedAt = new Date().toISOString();

const entries = computeRatings(schools, instructors, calculatedAt);

const ratingsFile: RatingsFile = {
  updated_at: calculatedAt,
  methodology_version: METHODOLOGY_VERSION,
  entries,
};

const outputPath = path.join(process.cwd(), "fixtures/ratings.json");
writeFileSync(outputPath, JSON.stringify(ratingsFile, null, 2) + "\n", "utf-8");

const instructorCount = entries.filter(
  (e) => e.subject_type === "instructor",
).length;
const schoolCount = entries.filter((e) => e.subject_type === "school").length;
console.log(
  `fixtures/ratings.json обновлён: ${instructorCount} инструкторов, ${schoolCount} школ (${calculatedAt}).`,
);
