// Mock data for the snowboard equipment store

export const products = [
  // Snowboards
  {
    id: "sb-001",
    name: "Alpine Freestyle Snowboard",
    category: "snowboards",
    price: 499.99,
    description: "A versatile all-mountain snowboard perfect for both beginners and intermediate riders. Features a twin-tip design for balanced performance in all conditions.",
    features: [
      "Twin-tip design",
      "Medium flex",
      "All-mountain versatility",
      "Sintered base",
      "Poplar wood core"
    ],
    specifications: {
      length: "155cm",
      width: "25cm",
      weight: "2.8kg",
      recommendedLevel: "Beginner to Intermediate"
    },
    stock: 15,
    images: ["/images/product-snowboard-1.jpg"],
    rating: 4.8,
    reviews: 24
  },
  {
    id: "sb-002",
    name: "Pro Carbon Freeride Snowboard",
    category: "snowboards",
    price: 699.99,
    description: "High-performance freeride snowboard with carbon reinforcements for advanced riders seeking speed and precision on challenging terrain.",
    features: [
      "Directional shape",
      "Stiff flex",
      "Carbon stringers",
      "Sintered high-speed base",
      "Lightweight core construction"
    ],
    specifications: {
      length: "162cm",
      width: "26cm",
      weight: "2.6kg",
      recommendedLevel: "Advanced to Expert"
    },
    stock: 8,
    images: ["/images/product-snowboard-2.jpg"],
    rating: 4.9,
    reviews: 16
  },
  {
    id: "sb-003",
    name: "Park Dominator Snowboard",
    category: "snowboards",
    price: 549.99,
    description: "Specially designed for terrain park enthusiasts, this snowboard offers maximum pop and stability for jumps, rails, and tricks.",
    features: [
      "True twin shape",
      "Medium-stiff flex",
      "Park-optimized profile",
      "Impact-resistant base",
      "Reinforced edges"
    ],
    specifications: {
      length: "152cm",
      width: "25.5cm",
      weight: "2.7kg",
      recommendedLevel: "Intermediate to Advanced"
    },
    stock: 12,
    images: ["/images/product-snowboard-3.jpg"],
    rating: 4.7,
    reviews: 19
  },
  
  // Bindings
  {
    id: "bd-001",
    name: "Pro Series Bindings",
    category: "bindings",
    price: 249.99,
    description: "High-performance bindings offering exceptional response and control for advanced riders. Features tool-less adjustment and premium padding.",
    features: [
      "Aluminum chassis",
      "Canted highbacks",
      "Tool-less adjustment",
      "3D ankle straps",
      "Impact-absorbing footbeds"
    ],
    specifications: {
      size: "Medium (US 7-10)",
      weight: "820g per binding",
      flex: "7/10 (Medium-Stiff)",
      mountingSystem: "Universal Disc"
    },
    stock: 20,
    images: ["/images/product-bindings-1.jpg"],
    rating: 4.7,
    reviews: 31
  },
  {
    id: "bd-002",
    name: "Freestyle Flex Bindings",
    category: "bindings",
    price: 189.99,
    description: "Flexible and forgiving bindings perfect for park riders and beginners. Offers comfort and easy adjustability.",
    features: [
      "Composite chassis",
      "Flexible highbacks",
      "Padded ankle straps",
      "Shock-absorbing heel cushion",
      "Quick-adjust ratchets"
    ],
    specifications: {
      size: "Large (US 10-13)",
      weight: "780g per binding",
      flex: "4/10 (Medium-Soft)",
      mountingSystem: "Universal Disc"
    },
    stock: 15,
    images: ["/images/product-bindings-2.jpg"],
    rating: 4.5,
    reviews: 22
  },
  
  // Boots
  {
    id: "bt-001",
    name: "Mountain Explorer Boots",
    category: "boots",
    price: 299.99,
    description: "Premium all-mountain boots with the perfect balance of comfort, support, and response. Features heat-moldable liners for a custom fit.",
    features: [
      "Heat-moldable liners",
      "BOA lacing system",
      "Vibram outsoles",
      "Articulating cuffs",
      "3D molded tongues"
    ],
    specifications: {
      size: "US 10",
      flex: "7/10 (Medium-Stiff)",
      liningMaterial: "Thermo-moldable foam",
      soleMaterial: "Vibram rubber"
    },
    stock: 10,
    images: ["/images/product-boots-1.jpg"],
    rating: 4.9,
    reviews: 27
  },
  {
    id: "bt-002",
    name: "Freestyle Comfort Boots",
    category: "boots",
    price: 229.99,
    description: "Soft and forgiving boots designed for park riders and beginners. Prioritizes comfort and easy entry/exit.",
    features: [
      "Quick-pull lacing",
      "Soft flex tongue",
      "Cushioned insoles",
      "Lightweight construction",
      "Grippy outsoles"
    ],
    specifications: {
      size: "US 9",
      flex: "4/10 (Soft)",
      liningMaterial: "Comfort foam",
      soleMaterial: "Rubber compound"
    },
    stock: 18,
    images: ["/images/product-boots-2.jpg"],
    rating: 4.6,
    reviews: 19
  },
  
  // Accessories
  {
    id: "ac-001",
    name: "Winter Goggles Pro",
    category: "accessories",
    price: 129.99,
    description: "High-performance goggles with interchangeable lenses for all light conditions. Features anti-fog technology and maximum UV protection.",
    features: [
      "Interchangeable lenses",
      "Anti-fog coating",
      "100% UV protection",
      "Helmet compatible",
      "Triple-layer foam"
    ],
    specifications: {
      frameSize: "Large",
      lensType: "Spherical",
      venting: "Full perimeter",
      includes: "2 lenses (bright and low light)"
    },
    stock: 25,
    images: ["/images/product-goggles-1.jpg"],
    rating: 4.6,
    reviews: 34
  },
  {
    id: "ac-002",
    name: "All-Weather Gloves",
    category: "accessories",
    price: 79.99,
    description: "Waterproof and breathable gloves with touchscreen compatibility. Keeps hands warm and dry in all winter conditions.",
    features: [
      "Waterproof membrane",
      "Insulated lining",
      "Touchscreen compatible",
      "Adjustable wrist straps",
      "Leather palm reinforcement"
    ],
    specifications: {
      size: "Medium",
      material: "Nylon shell with leather palm",
      insulation: "Thinsulate 100g",
      waterproofRating: "10,000mm"
    },
    stock: 30,
    images: ["/images/product-gloves-1.jpg"],
    rating: 4.7,
    reviews: 29
  },
  {
    id: "ac-003",
    name: "Slope Ready Helmet",
    category: "accessories",
    price: 149.99,
    description: "Lightweight and durable helmet with adjustable ventilation and audio-ready ear pads. Meets all safety certifications.",
    features: [
      "MIPS protection system",
      "Adjustable ventilation",
      "Audio-ready ear pads",
      "Goggle compatibility",
      "Removable liner"
    ],
    specifications: {
      size: "Medium (56-58cm)",
      weight: "450g",
      certifications: "ASTM F2040, CE EN1077",
      construction: "In-mold"
    },
    stock: 22,
    images: ["/images/product-helmet-1.jpg"],
    rating: 4.8,
    reviews: 21
  }
];

export const getProductById = (id) => {
  return products.find(product => product.id === id) || null;
};

export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

export const getRelatedProducts = (productId, limit = 4) => {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];
  
  return products
    .filter(product => product.category === currentProduct.category && product.id !== productId)
    .slice(0, limit);
};

export const getFeaturedProducts = (limit = 4) => {
  // In a real app, you might have a "featured" flag or use other criteria
  return products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};
