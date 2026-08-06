import { z } from "zod";

export const WizardResultSchema = z.object({
  age_bracket: z.enum(["16-17", "18-24", "25-35", "36+"]),
  has_medical_certificate: z.enum(["yes", "no", "unknown"]),
  gearbox_preference: z.enum(["manual", "automatic", "undecided"]),
  city_id: z.string(),
  computed_steps: z.array(
    z.object({
      step_id: z.string(),
      price_eur: z.number(),
      duration_label: z.string(),
    }),
  ),
  computed_total_eur: z.number(),
  computed_deadline: z.string(),
  is_estimated_fallback: z.boolean(),
});

export const UserStateSchema = z.object({
  user_id: z.string().nullable(),
  phase: z.enum([
    "choosing-school",
    "learning-theory",
    "driving-with-instructor",
    "preparing-exam",
    "failed-exam",
    "got-license",
  ]),
  wizard_result: WizardResultSchema.nullable(),
  saved_path_email: z.string().nullable(),
  theory_progress: z.array(
    z.object({
      question_id: z.string(),
      correct: z.boolean(),
      answered_at: z.string(),
    }),
  ),
  tracker_lessons: z.array(
    z.object({
      date: z.string(),
      instructor_id: z.string().nullable(),
      duration_min: z.number(),
      skill_tags: z.array(z.string()),
    }),
  ),
  deadlines: z.array(z.object({ label: z.string(), due_date: z.string() })),
  push_opt_in: z.boolean(),
  updated_at: z.string(),
});
