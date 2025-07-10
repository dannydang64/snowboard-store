# Snowboard Equipment Store

A mock e-commerce application for selling snowboarding equipment. This application is built with Next.js and Firebase, providing a realistic online shopping experience.

## Features

- Browse products by category (Snowboards, Bindings, Boots, Accessories)
- Product filtering and sorting
- Product detail pages with specifications
- Shopping cart functionality
- Checkout process
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **API**: REST API using Next.js API Routes

## Project Structure

```
snowboard-store/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── cart/         # Shopping cart page
│   │   ├── checkout/     # Checkout process
│   │   ├── products/     # Product listings and details
│   │   └── ...
│   ├── components/       # Reusable React components
│   └── lib/              # Utility functions and data
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd snowboard-store
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up Firebase
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore and Authentication
   - Update the Firebase configuration in `src/lib/firebase.js` with your project credentials

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Configuration

To use Firebase, you'll need to update the configuration in `src/lib/firebase.js` with your own Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Testing

This application is designed to be a playground for creating test cases. The mock e-commerce functionality provides various scenarios for testing, including:

- Product browsing and filtering
- Shopping cart operations
- Checkout process
- Form validation
- API interactions

## License

This project is licensed under the MIT License.
