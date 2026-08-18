import { loadFixture } from "./loadFixture";
import { CsddTariffsFileSchema } from "../../schemas/csddTariffs";
import { SchoolsFileSchema } from "../../schemas/schools";
import { InstructorsFileSchema } from "../../schemas/instructors";
import { RatingsFileSchema } from "../../schemas/ratings";
import { ExamZonesFileSchema } from "../../schemas/examZones";
import { TheoryQuestionsFileSchema } from "../../schemas/theoryQuestions";
import { UserStateSchema } from "../../schemas/userState";
import { CostModelFileSchema } from "../../schemas/costModel";
import { CsddCentersFileSchema } from "../../schemas/csddCenters";
import { FirstAidProvidersFileSchema } from "../../schemas/firstAidProviders";
import { MedicalCheckLocationsFileSchema } from "../../schemas/medicalCheckLocations";
import { CarMaintenanceCostModelSchema } from "../../schemas/carMaintenanceCostModel";
import { TrafficSignsFileSchema } from "../../schemas/trafficSigns";
import type {
  CsddTariffsFile,
  SchoolsFile,
  InstructorsFile,
  RatingsFile,
  ExamZonesFile,
  TheoryQuestionsFile,
  UserState,
  CostModelFile,
  CsddCentersFile,
  FirstAidProvidersFile,
  MedicalCheckLocationsFile,
  CarMaintenanceCostModel,
  TrafficSignsFile,
} from "../../types/data";

/*
 * Единая точка доступа к данным проекта. Сейчас читает /fixtures/*.json
 * (docs/03-data-model.md), позже за этим же интерфейсом спрячется реальный
 * ETL/Supabase — вызывающий код (компоненты, формулы) не меняется.
 */

export function getCsddTariffs(): CsddTariffsFile {
  return loadFixture("csdd_tariffs.json", CsddTariffsFileSchema);
}

export function getSchools(): SchoolsFile {
  return loadFixture("schools.json", SchoolsFileSchema);
}

export function getInstructors(): InstructorsFile {
  return loadFixture("instructors.json", InstructorsFileSchema);
}

export function getRatings(): RatingsFile {
  return loadFixture("ratings.json", RatingsFileSchema);
}

export function getExamZones(): ExamZonesFile {
  return loadFixture("exam_zones.json", ExamZonesFileSchema);
}

export function getTheoryQuestions(): TheoryQuestionsFile {
  return loadFixture("theory_questions.json", TheoryQuestionsFileSchema);
}

export function getUserStateFixture(): UserState {
  return loadFixture("user_state.json", UserStateSchema);
}

export function getCostModel(): CostModelFile {
  return loadFixture("cost_model.json", CostModelFileSchema);
}

export function getCsddCenters(): CsddCentersFile {
  return loadFixture("csdd_centers.json", CsddCentersFileSchema);
}

export function getFirstAidProviders(): FirstAidProvidersFile {
  return loadFixture("first_aid_providers.json", FirstAidProvidersFileSchema);
}

export function getMedicalCheckLocations(): MedicalCheckLocationsFile {
  return loadFixture(
    "medical_check_locations.json",
    MedicalCheckLocationsFileSchema,
  );
}

export function getCarMaintenanceCostModel(): CarMaintenanceCostModel {
  return loadFixture(
    "car_maintenance_cost_model.json",
    CarMaintenanceCostModelSchema,
  );
}

export function getTrafficSigns(): TrafficSignsFile {
  return loadFixture("traffic_signs.json", TrafficSignsFileSchema);
}
