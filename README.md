# Restaurant App

A cross-platform restaurant management system with a mobile customer interface and a web-based staff dashboard.

---

##  Features

### Customer (Mobile App)
- Browse menu items with images, names, and prices
- View detailed info: descriptions & allergens
- Add multiple items to cart
- Enter table number once per session
- Review & confirm order before submitting

### Staff/Admin (Web App)
- Upload food items with image, name, price, description, and allergens
- View incoming orders by table
- End sessions and clear bills
- Secure login with Firebase Auth

---

## Tech Stack

- **Mobile App**: React Native (Expo)
- **Web App**: React (Vite or Next.js)
- **Backend**: Firebase Firestore, Firebase Auth, Firebase Storage
- **Routing**: React Navigation (Mobile), React Router (Web)

---

## Project Structure

```
restaurant-app/
|--apps/
  ├── mobile/         # Expo customer-facing app
  ├── web/            # Staff dashboard (React/Vite)
├── shared/         # Shared Firebase config
└── README.md
```

---

##  Getting Started Locally

### 1. Clone the Repository

```bash
git clone https://github.com/tino-ryan/restaurant-app.git
cd restaurant-app
```

---

### 2. Run the Mobile App (Customer)

```bash
cd mobile
npm install
npx expo start
```

Open in Expo Go app or Android/iOS emulator.

---

### 3. Run the Web App (Staff/Admin)

```bash
cd web
npm install
npm run dev
```

Then go to [http://localhost:5173](http://localhost:5173) or whatever Vite outputs.

---



## Authentication

- Firebase Email/Password Auth is required for staff.
use test@example.com
password : testing
- Customers do not require login.

---

## Notes

- Firebase Storage requires billing if your region doesn't support free tier.
- Make sure Firestore rules are set securely (read/write access only for authenticated users where needed).

---

## Contributors

- [Tinotenda Gozho](https://github.com/tino-ryan)

---

## License

MIT License
