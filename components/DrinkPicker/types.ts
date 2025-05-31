export type DrinkCategory = "Vino" | "Birra" | "Cocktail" | "Superalcolici";

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
