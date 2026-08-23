import { z } from "zod";

export const SchoolSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  city_id: z.string(),
  address: z.string(),
  csdd_registration_number: z.string(),
  languages: z.array(z.enum(["lv", "ru", "en"])),
  gearbox: z.array(z.enum(["manual", "automatic"])),
  categories: z.array(z.string()),
  is_partner: z.boolean(),
  partner_price_eur: z.number().nullable(),
  phone: z.string().nullable(),
  contact_email: z.string().nullable(),
  website: z.string().nullable(),
  data_available_for_rating: z.boolean(),
});

export const SchoolsFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum([
    "placeholder",
    "csdd-export-xlsx",
    "partner-onboarding-form",
  ]),
  schools: z.array(SchoolSchema),
});
