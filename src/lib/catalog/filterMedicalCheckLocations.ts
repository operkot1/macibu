import type { MedicalCheckLocation } from "../../types/data";
import { filterByCity } from "./filterByCity";

export interface MedicalCheckLocationFilters {
  city_id?: string;
}

export function filterMedicalCheckLocations(
  locations: MedicalCheckLocation[],
  filters: MedicalCheckLocationFilters,
): MedicalCheckLocation[] {
  return filterByCity(locations, filters.city_id);
}
