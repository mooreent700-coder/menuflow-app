export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Plates' | 'Desserts' | 'Beverages';
  image: string;
};

export type RestaurantData = {
  slug: string;
  name: string;
  phone: string;
  logo: string;
  hero: string;
  accent: string;
  items: MenuItem[];
};

export const demoRestaurant: RestaurantData = {
  slug: 'cultured-soul-kitchen',
  name: 'The Cultured Soul Kitchen',
  phone: '13238127102',
  logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
  accent: '#d4af37',
  items: [
    {
      id: '1',
      name: 'Smoked Rib Plate',
      description: 'Tender ribs, mac & cheese, greens, cornbread.',
      price: 26,
      category: 'Plates',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: '2',
      name: 'Cajun Chicken Plate',
      description: 'Seasoned baked chicken with rice and candied yams.',
      price: 22,
      category: 'Plates',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: '3',
      name: 'Banana Pudding',
      description: 'Creamy banana pudding with wafer crunch.',
      price: 8,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: '4',
      name: 'Homemade Lemonade',
      description: 'Fresh lemonade over ice.',
      price: 4.5,
      category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80'
    }
  ]
};
