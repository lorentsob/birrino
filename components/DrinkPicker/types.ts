export type DrinkCategory = "Wine" | "Beer" | "Cocktail" | "Spirits";

export interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  abv: number;
  units: number;
}

export interface DrinkWithFav extends Drink {
  isFavorite?: boolean;
}
