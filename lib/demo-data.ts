export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
};

export type RestaurantData = {
  name: string;
  slug: string;
  description?: string;

  logo?: string;
  hero?: string;
  phone?: string;

  items: MenuItem[];
};

export const demoRestaurant: RestaurantData = {
  name: "MenuFlow Demo",
  slug: "menuflow-demo",
  description: "Your digital menu",

  logo: "",
  hero: "",
  phone: "",

  items: [],
};