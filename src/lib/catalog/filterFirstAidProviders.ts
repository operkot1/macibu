import type { FirstAidProvider } from "../../types/data";
import { filterByCity } from "./filterByCity";

export interface FirstAidProviderFilters {
  city_id?: string;
}

/*
 * filterFirstAidProviders — тонкая обёртка над общей filterByCity
 * (T-072 добавил второго похожего потребителя — MedicalCheckLocation,
 * логика вынесена туда, здесь остался только типизированный вход/выход
 * для FirstAidProvider).
 */
export function filterFirstAidProviders(
  providers: FirstAidProvider[],
  filters: FirstAidProviderFilters,
): FirstAidProvider[] {
  return filterByCity(providers, filters.city_id);
}
