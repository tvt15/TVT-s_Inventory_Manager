# 🚀 Next-Gen Inventory Management System
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MUI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
## 🌟 Overview

Welcome to our cutting-edge Inventory Management System! This project leverages modern web technologies to provide a seamless, user-friendly experience for managing your inventory needs.

## 📸 Screenshots

<table>
  <tr>
    <td>Login Screen</td>
    <td>Dashboard</td>
  </tr>
  <tr>
    <td><img src="path_to_login_screenshot.png" width="400"/></td>
    <td><img src="path_to_dashboard_screenshot.png" width="400"/></td>
  </tr>
  <tr>
    <td>Add New Item</td>
    <td>Item Details</td>
  </tr>
  <tr>
    <td><img src="path_to_add_item_screenshot.png" width="400"/></td>
    <td><img src="path_to_item_details_screenshot.png" width="400"/></td>
  </tr>
</table>
## 🛠 Technologies Used

- **Frontend:**
  - ⚛️ React.js
  - 🔺 Next.js
  - 🎨 Material-UI (MUI)

- **Backend:**
    - 🔥 Firebase
    - 🔐 Authentication
    - 🗄️ Firestore Database

- **State Management:**
  - 🪝 React Hooks

- **Styling:**
  - 💅 CSS Modules

- **Hosting**
    - Vercel

## ✨ Features

### 1. 🔒 User Authentication
- Secure sign-up and login functionality
- Google Sign-In integration
- Email/Password authentication

### 2. 📊 Inventory Management
- Add new items with detailed information:
  - Name
  - Category
  - Price
  - Description
  - Supplier
  - Quantity
- Edit existing items
- Delete items
- Increase/Decrease item quantity

### 3. 🔍 Advanced Filtering and Sorting
- Sort items by:
  - Name
  - Category
  - Price
- Filter items by category

### 4. 👀 Item Details View
- Compact card view showing essential info
- Detailed view accessible via an "eye" icon

### 5. 🎨 User-Friendly Interface
- Responsive design for various screen sizes
- Intuitive icons for actions
- Modal dialogs for adding and editing items

### 6. 🔒 Data Security
- User-specific inventories
- Firestore security rules to protect user data

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/tvt15/TVT-s_Inventory_Manager.git 
```

2. Install dependencies:

```bash
cd inventory-management
npm install
```

3. Set up your Firebase configuration in `firebase.js`

Make sure the Rules are as below:
```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📚 Documentation

For more detailed information about the project structure and API, please refer to our [Documentation](docs/index.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Material-UI Documentation](https://mui.com/getting-started/usage/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

Built with ❤️ by Tanishq Todkar (TVT)