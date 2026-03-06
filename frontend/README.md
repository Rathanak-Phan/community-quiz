# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 📁 Recommended React Frontend Folder Structure

```
frontend/
│
├── public/
│   └── index.html
│
├── src/
│
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── logo/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   ├── quiz/
│   │   │   ├── QuizCard.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   └── AnswerInput.jsx
│   │   │
│   │   ├── community/
│   │   │   └── CommunityCard.jsx
│   │   │
│   │   └── category/
│   │       └── CategoryCard.jsx
│   │
│   ├── pages/
│   │
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── category/
│   │   │   ├── CategoryList.jsx
│   │   │   ├── CreateCategory.jsx
│   │   │   └── EditCategory.jsx
│   │   │
│   │   ├── community/
│   │   │   ├── CommunityList.jsx
│   │   │   ├── CreateCommunity.jsx
│   │   │   └── CommunityDetail.jsx
│   │   │
│   │   ├── quiz/
│   │   │   ├── QuizList.jsx
│   │   │   ├── CreateQuiz.jsx
│   │   │   ├── QuizDetail.jsx
│   │   │   └── AttemptQuiz.jsx
│   │   │
│   │   ├── leaderboard/
│   │   │   └── Leaderboard.jsx
│   │   │
│   │   └── favorites/
│   │       └── Favorites.jsx
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── quizService.js
│   │   ├── communityService.js
│   │   └── categoryService.js
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── utils/
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── styles/
│   │   └── index.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── package.json
└── tailwind.config.js
```

---

# 🧠 Why This Structure is Good for Your Project

Because your system has **many modules**:

| Feature         | Folder              |
| --------------- | ------------------- |
| Login/Register  | `pages/auth`        |
| Quiz Management | `pages/quiz`        |
| Community       | `pages/community`   |
| Category        | `pages/category`    |
| Leaderboard     | `pages/leaderboard` |
| Favorites       | `pages/favorites`   |
| Shared UI       | `components/common` |

This keeps everything **organized and easy to maintain**.

---