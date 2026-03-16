import { getJitCafeAssetPath } from "../lib/paths";

// Generated from the backend public /menu response.
// Update this snapshot when the published menu changes.
// Source endpoint: /api/restaurant/v1/menu

export type StaticMenuSnapshotItem = {
  addOnCount: number;
  basePrice: number;
  description: string;
  featured: boolean;
  imageAlt: string | null;
  imageUrl: string | null;
  ingredientCount: number;
  name: string;
};

export type StaticMenuSnapshotSection = {
  category: string;
  displayOrder: number;
  items: StaticMenuSnapshotItem[];
  name: string;
};

const rawStaticMenuSnapshot: StaticMenuSnapshotSection[] = [
  {
    "category": "Food",
    "displayOrder": 1,
    "items": [
      {
        "addOnCount": 1,
        "basePrice": 6.25,
        "description": "All-beef dog with mustard, relish, and onions.",
        "featured": true,
        "imageAlt": "Food photo of a hot dog with toppings",
        "imageUrl": "/foodiesfeed-hot-dog.webp",
        "ingredientCount": 3,
        "name": "Chicago Dog"
      },
      {
        "addOnCount": 1,
        "basePrice": 7.25,
        "description": "All-beef dog topped with house chili and cheese.",
        "featured": false,
        "imageAlt": "Food photo of a hot dog with toppings",
        "imageUrl": "/foodiesfeed-hot-dog.webp",
        "ingredientCount": 3,
        "name": "Chili Cheese Dog"
      },
      {
        "addOnCount": 1,
        "basePrice": 7.45,
        "description": "Extra-long all-beef hot dog with classic toppings.",
        "featured": false,
        "imageAlt": "Food photo of a hot dog with toppings",
        "imageUrl": "/foodiesfeed-hot-dog.webp",
        "ingredientCount": 3,
        "name": "Jumbo Hot Dog"
      },
      {
        "addOnCount": 1,
        "basePrice": 8.35,
        "description": "All-beef dog smothered with chili, cheese, and onions.",
        "featured": true,
        "imageAlt": "Food photo of a hot dog with toppings",
        "imageUrl": "/foodiesfeed-hot-dog.webp",
        "ingredientCount": 3,
        "name": "Chili Dog Deluxe"
      }
    ],
    "name": "Hot dogs and Chicago classics"
  },
  {
    "category": "Food",
    "displayOrder": 2,
    "items": [
      {
        "addOnCount": 1,
        "basePrice": 7.95,
        "description": "Grilled polish sausage with mustard and caramelized onions.",
        "featured": false,
        "imageAlt": "Food photo of browned sausages in a pan",
        "imageUrl": "/foodiesfeed-sausage.webp",
        "ingredientCount": 2,
        "name": "Maxwell Street Polish"
      },
      {
        "addOnCount": 1,
        "basePrice": 8.25,
        "description": "Bratwurst on a toasted bun with mustard and onions.",
        "featured": false,
        "imageAlt": "Food photo of browned sausages in a pan",
        "imageUrl": "/foodiesfeed-sausage.webp",
        "ingredientCount": 2,
        "name": "Char-Grilled Bratwurst"
      }
    ],
    "name": "Sausage and polish"
  },
  {
    "category": "Food",
    "displayOrder": 3,
    "items": [
      {
        "addOnCount": 2,
        "basePrice": 8.5,
        "description": "Single patty with cheese, onions, and pickles.",
        "featured": false,
        "imageAlt": "Food photo of a stacked beef burger",
        "imageUrl": "/foodiesfeed-burger.webp",
        "ingredientCount": 3,
        "name": "Cheeseburger"
      },
      {
        "addOnCount": 1,
        "basePrice": 10.95,
        "description": "Two patties with cheese, onions, and pickles.",
        "featured": true,
        "imageAlt": "Food photo of a stacked beef burger",
        "imageUrl": "/foodiesfeed-burger.webp",
        "ingredientCount": 3,
        "name": "Double Cheeseburger"
      },
      {
        "addOnCount": 2,
        "basePrice": 11.75,
        "description": "Double burger layered with cheese, bacon flavor, and pickles.",
        "featured": true,
        "imageAlt": "Food photo of a stacked beef burger",
        "imageUrl": "/foodiesfeed-burger.webp",
        "ingredientCount": 3,
        "name": "Bacon Cheeseburger"
      },
      {
        "addOnCount": 1,
        "basePrice": 11.25,
        "description": "Burger with melty cheese and savory mushrooms.",
        "featured": false,
        "imageAlt": "Food photo of a stacked beef burger",
        "imageUrl": "/foodiesfeed-burger.webp",
        "ingredientCount": 2,
        "name": "Mushroom Swiss Burger"
      },
      {
        "addOnCount": 1,
        "basePrice": 11.5,
        "description": "Seasoned patty with grilled onions and melted cheese.",
        "featured": false,
        "imageAlt": "Food photo of a stacked beef burger",
        "imageUrl": "/foodiesfeed-burger.webp",
        "ingredientCount": 2,
        "name": "Patty Melt Burger"
      }
    ],
    "name": "Burgers"
  },
  {
    "category": "Food",
    "displayOrder": 4,
    "items": [
      {
        "addOnCount": 1,
        "basePrice": 9.25,
        "description": "Crispy chicken breast with mayo and pickles.",
        "featured": true,
        "imageAlt": "Food photo of a loaded sandwich on a baguette",
        "imageUrl": "/foodiesfeed-sandwich.webp",
        "ingredientCount": 2,
        "name": "Crispy Chicken Sandwich"
      },
      {
        "addOnCount": 1,
        "basePrice": 9.95,
        "description": "Marinated grilled chicken with mayo and pickles.",
        "featured": false,
        "imageAlt": "Food photo of a loaded sandwich on a baguette",
        "imageUrl": "/foodiesfeed-sandwich.webp",
        "ingredientCount": 2,
        "name": "Grilled Chicken Sandwich"
      },
      {
        "addOnCount": 1,
        "basePrice": 8.95,
        "description": "Crispy fish filet with mayo on a toasted bun.",
        "featured": false,
        "imageAlt": "Food photo of a loaded sandwich on a baguette",
        "imageUrl": "/foodiesfeed-sandwich.webp",
        "ingredientCount": 1,
        "name": "Fish Sandwich"
      },
      {
        "addOnCount": 1,
        "basePrice": 10.25,
        "description": "Crispy chicken with spicy mayo and pickles.",
        "featured": true,
        "imageAlt": "Food photo of a loaded sandwich on a baguette",
        "imageUrl": "/foodiesfeed-sandwich.webp",
        "ingredientCount": 2,
        "name": "Spicy Chicken Sandwich"
      }
    ],
    "name": "Chicken and sandwiches"
  },
  {
    "category": "Food",
    "displayOrder": 5,
    "items": [
      {
        "addOnCount": 2,
        "basePrice": 10.95,
        "description": "Thin-sliced beef with sweet peppers or giardiniera.",
        "featured": true,
        "imageAlt": "Food photo of a loaded sandwich on a baguette",
        "imageUrl": "/foodiesfeed-sandwich.webp",
        "ingredientCount": 2,
        "name": "Italian Beef"
      },
      {
        "addOnCount": 1,
        "basePrice": 13.95,
        "description": "Italian beef stacked with a grilled sausage link.",
        "featured": false,
        "imageAlt": "Food photo of browned sausages in a pan",
        "imageUrl": "/foodiesfeed-sausage.webp",
        "ingredientCount": 2,
        "name": "Combo Beef and Sausage"
      },
      {
        "addOnCount": 1,
        "basePrice": 12.25,
        "description": "Italian beef with melted cheddar and sweet peppers.",
        "featured": false,
        "imageAlt": "Food photo of a loaded sandwich on a baguette",
        "imageUrl": "/foodiesfeed-sandwich.webp",
        "ingredientCount": 2,
        "name": "Beef and Cheddar"
      }
    ],
    "name": "Italian beef"
  },
  {
    "category": "Food",
    "displayOrder": 6,
    "items": [
      {
        "addOnCount": 1,
        "basePrice": 3.95,
        "description": "Golden crinkle-cut fries with seasoning salt.",
        "featured": false,
        "imageAlt": "Food photo of crispy fries served with ketchup",
        "imageUrl": "/foodiesfeed-fries.webp",
        "ingredientCount": 1,
        "name": "Crinkle Fries"
      },
      {
        "addOnCount": 2,
        "basePrice": 5.95,
        "description": "Crinkle fries finished with warm cheese sauce.",
        "featured": true,
        "imageAlt": "Food photo of crispy fries served with ketchup",
        "imageUrl": "/foodiesfeed-fries.webp",
        "ingredientCount": 2,
        "name": "Cheese Fries"
      },
      {
        "addOnCount": 1,
        "basePrice": 4.95,
        "description": "Crispy golden onion rings with seasoning salt.",
        "featured": false,
        "imageAlt": "Food photo of crispy fries served with ketchup",
        "imageUrl": "/foodiesfeed-fries.webp",
        "ingredientCount": 1,
        "name": "Onion Rings"
      },
      {
        "addOnCount": 1,
        "basePrice": 6.5,
        "description": "Breaded mozzarella sticks served hot and crisp.",
        "featured": false,
        "imageAlt": "Food photo of crispy fries served with ketchup",
        "imageUrl": "/foodiesfeed-fries.webp",
        "ingredientCount": 0,
        "name": "Mozzarella Sticks"
      },
      {
        "addOnCount": 1,
        "basePrice": 7.25,
        "description": "Crinkle fries loaded with cheddar sauce and seasonings.",
        "featured": true,
        "imageAlt": "Food photo of crispy fries served with ketchup",
        "imageUrl": "/foodiesfeed-fries.webp",
        "ingredientCount": 2,
        "name": "Loaded Cheese Fries"
      }
    ],
    "name": "Fries and sides"
  },
  {
    "category": "Drinks",
    "displayOrder": 7,
    "items": [
      {
        "addOnCount": 1,
        "basePrice": 3.75,
        "description": "House lemonade over ice.",
        "featured": true,
        "imageAlt": "Stock photo of fresh lemonade in a glass",
        "imageUrl": "/foodiesfeed-lemonade.webp",
        "ingredientCount": 1,
        "name": "Fresh Lemonade"
      },
      {
        "addOnCount": 0,
        "basePrice": 2.95,
        "description": "Cold fountain soda served over ice.",
        "featured": false,
        "imageAlt": "Stock photo of cold drinks served together",
        "imageUrl": "/foodiesfeed-soda.webp",
        "ingredientCount": 0,
        "name": "Fountain Soda"
      },
      {
        "addOnCount": 0,
        "basePrice": 2.95,
        "description": "Freshly brewed iced tea.",
        "featured": false,
        "imageAlt": "Stock photo of iced tea in a glass",
        "imageUrl": "/foodiesfeed-iced-tea.webp",
        "ingredientCount": 1,
        "name": "Iced Tea"
      },
      {
        "addOnCount": 0,
        "basePrice": 2.5,
        "description": "Cold bottled water.",
        "featured": false,
        "imageAlt": "Stock photo of chilled water with lime",
        "imageUrl": "/foodiesfeed-water.webp",
        "ingredientCount": 0,
        "name": "Bottled Water"
      }
    ],
    "name": "Fountain and bottled drinks"
  },
  {
    "category": "Coffee",
    "displayOrder": 8,
    "items": [
      {
        "addOnCount": 3,
        "basePrice": 2.95,
        "description": "Fresh-brewed medium roast with a smooth, balanced finish.",
        "featured": false,
        "imageAlt": "Stock photo of a cappuccino in a coffeeshop",
        "imageUrl": "/foodiesfeed-coffee.webp",
        "ingredientCount": 0,
        "name": "House Coffee"
      },
      {
        "addOnCount": 3,
        "basePrice": 3.45,
        "description": "Bold espresso mellowed with hot water for a clean, rich cup.",
        "featured": false,
        "imageAlt": "Stock photo of a cappuccino in a coffeeshop",
        "imageUrl": "/foodiesfeed-coffee.webp",
        "ingredientCount": 0,
        "name": "Americano"
      },
      {
        "addOnCount": 3,
        "basePrice": 4.75,
        "description": "Espresso with steamed milk and thick foam.",
        "featured": true,
        "imageAlt": "Stock photo of a cappuccino in a coffeeshop",
        "imageUrl": "/foodiesfeed-coffee.webp",
        "ingredientCount": 0,
        "name": "Cappuccino"
      },
      {
        "addOnCount": 3,
        "basePrice": 5.35,
        "description": "Espresso and steamed milk sweetened with vanilla syrup.",
        "featured": true,
        "imageAlt": "Stock photo of a cappuccino in a coffeeshop",
        "imageUrl": "/foodiesfeed-coffee.webp",
        "ingredientCount": 0,
        "name": "Vanilla Latte"
      },
      {
        "addOnCount": 3,
        "basePrice": 5.55,
        "description": "Espresso, chocolate, and steamed milk finished cafe-style.",
        "featured": true,
        "imageAlt": "Stock photo of a cappuccino in a coffeeshop",
        "imageUrl": "/foodiesfeed-coffee.webp",
        "ingredientCount": 0,
        "name": "Mocha Latte"
      },
      {
        "addOnCount": 3,
        "basePrice": 4.45,
        "description": "Slow-steeped coffee served cold over ice.",
        "featured": true,
        "imageAlt": "Stock photo of a cappuccino in a coffeeshop",
        "imageUrl": "/foodiesfeed-coffee.webp",
        "ingredientCount": 0,
        "name": "Cold Brew"
      }
    ],
    "name": "Coffee and espresso"
  },
  {
    "category": "Drinks",
    "displayOrder": 9,
    "items": [
      {
        "addOnCount": 0,
        "basePrice": 4.95,
        "description": "Classic vanilla shake blended thick.",
        "featured": true,
        "imageAlt": "Stock photo of a thick milkshake",
        "imageUrl": "/foodiesfeed-shake.webp",
        "ingredientCount": 0,
        "name": "Vanilla Shake"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.25,
        "description": "Creamy chocolate shake with rich cocoa flavor.",
        "featured": true,
        "imageAlt": "Stock photo of a thick milkshake",
        "imageUrl": "/foodiesfeed-shake.webp",
        "ingredientCount": 0,
        "name": "Chocolate Shake"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.5,
        "description": "Root beer with vanilla ice cream float.",
        "featured": false,
        "imageAlt": "Stock photo of a thick milkshake",
        "imageUrl": "/foodiesfeed-shake.webp",
        "ingredientCount": 0,
        "name": "Root Beer Float"
      }
    ],
    "name": "Milkshakes and floats"
  },
  {
    "category": "Desserts",
    "displayOrder": 10,
    "items": [
      {
        "addOnCount": 0,
        "basePrice": 3.75,
        "description": "Fudgy brownie square served warm.",
        "featured": false,
        "imageAlt": "Stock photo of a rich chocolate brownie",
        "imageUrl": "/foodiesfeed-brownie.webp",
        "ingredientCount": 0,
        "name": "Chocolate Brownie"
      },
      {
        "addOnCount": 0,
        "basePrice": 3.95,
        "description": "Apple pie slice with cinnamon notes.",
        "featured": false,
        "imageAlt": "Stock photo of apple pie",
        "imageUrl": "/foodiesfeed-apple-pie.webp",
        "ingredientCount": 0,
        "name": "Warm Apple Pie"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.25,
        "description": "Creamy cheesecake slice topped with strawberry glaze.",
        "featured": true,
        "imageAlt": "Stock photo of a cheesecake slice with berries",
        "imageUrl": "/foodiesfeed-cheesecake.webp",
        "ingredientCount": 0,
        "name": "Strawberry Cheesecake"
      },
      {
        "addOnCount": 0,
        "basePrice": 2.95,
        "description": "Large bakery cookie served warm.",
        "featured": false,
        "imageAlt": "Stock photo of a chocolate chip cookie",
        "imageUrl": "/foodiesfeed-cookie.webp",
        "ingredientCount": 0,
        "name": "Chocolate Chip Cookie"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.25,
        "description": "Crisp funnel cake sticks with powdered sugar.",
        "featured": false,
        "imageAlt": "Stock photo of churros with chocolate sauce",
        "imageUrl": "/foodiesfeed-churros.webp",
        "ingredientCount": 0,
        "name": "Funnel Cake Fries"
      },
      {
        "addOnCount": 0,
        "basePrice": 4.75,
        "description": "Banana pudding layered with cookie crumble.",
        "featured": false,
        "imageAlt": "Stock photo of a cheesecake slice with berries",
        "imageUrl": "/foodiesfeed-cheesecake.webp",
        "ingredientCount": 0,
        "name": "Banana Pudding Cup"
      },
      {
        "addOnCount": 0,
        "basePrice": 4.5,
        "description": "Vanilla soft serve with chocolate drizzle.",
        "featured": true,
        "imageAlt": "Stock photo of ice cream with chocolate",
        "imageUrl": "/foodiesfeed-ice-cream.webp",
        "ingredientCount": 0,
        "name": "Soft Serve Sundae"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.45,
        "description": "Warm churro sticks rolled in cinnamon sugar.",
        "featured": false,
        "imageAlt": "Stock photo of churros with chocolate sauce",
        "imageUrl": "/foodiesfeed-churros.webp",
        "ingredientCount": 0,
        "name": "Cinnamon Sugar Churros"
      }
    ],
    "name": "Desserts and sweets"
  },
  {
    "category": "Kids",
    "displayOrder": 11,
    "items": [
      {
        "addOnCount": 0,
        "basePrice": 6.25,
        "description": "Kids-size hot dog served with a side and drink.",
        "featured": false,
        "imageAlt": "Food photo of a hot dog with toppings",
        "imageUrl": "/foodiesfeed-hot-dog.webp",
        "ingredientCount": 2,
        "name": "Kids Hot Dog Meal"
      },
      {
        "addOnCount": 1,
        "basePrice": 7.25,
        "description": "Kids-size cheeseburger served with a side and drink.",
        "featured": false,
        "imageAlt": "Food photo of a stacked beef burger",
        "imageUrl": "/foodiesfeed-burger.webp",
        "ingredientCount": 2,
        "name": "Kids Cheeseburger Meal"
      }
    ],
    "name": "Kids meals"
  },
  {
    "category": "Beer",
    "displayOrder": 12,
    "items": [
      {
        "addOnCount": 0,
        "basePrice": 5.95,
        "description": "Clean and crisp lager served on draft.",
        "featured": true,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "House Lager Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.95,
        "description": "Juicy IPA with citrus aroma and soft bitterness.",
        "featured": true,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Hazy IPA Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.45,
        "description": "Balanced amber ale with caramel malt notes.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Amber Ale Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.5,
        "description": "Bright pilsner in a chilled can.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Pilsner Can"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.75,
        "description": "Hop-forward IPA in a chilled can.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "West Coast IPA Can"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.95,
        "description": "Dark stout in a chilled can with roasted flavor.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Stout Can"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.85,
        "description": "Smooth porter with cocoa and toasted malt notes.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Porter Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.35,
        "description": "Refreshing wheat ale with citrus and spice.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Wheat Ale Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.75,
        "description": "Easy-drinking lager served in a chilled can.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Mexican Lager Can"
      },
      {
        "addOnCount": 0,
        "basePrice": 6.55,
        "description": "Malty brown ale with nutty finish.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Brown Ale Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 7.25,
        "description": "Toasty seasonal marzen served on draft.",
        "featured": true,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Seasonal Marzen Draft"
      },
      {
        "addOnCount": 0,
        "basePrice": 5.25,
        "description": "Zero-proof lager in a chilled can.",
        "featured": false,
        "imageAlt": "Stock photo of a poured pilsner beer",
        "imageUrl": "/foodiesfeed-beer.webp",
        "ingredientCount": 0,
        "name": "Non-Alcoholic Lager Can"
      }
    ],
    "name": "Draft and canned beer"
  }
];

export const staticMenuSnapshot: StaticMenuSnapshotSection[] = rawStaticMenuSnapshot.map(
  (section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      imageUrl: item.imageUrl ? getJitCafeAssetPath(item.imageUrl) : null,
    })),
  }),
);
