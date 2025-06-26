import "./App.css";
import MainFrameSplit from "./frames/MainFrameSplit";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import BreezyLoader from "./components/BreezyLoader";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import MessagesPage from "./pages/MessagesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PasswordRecoveryPage from "./pages/PasswordRecover";
import { useAuthAttributes } from "./context/AuthAttributsContext";
import UserSearchPage from "./pages/SearchPage";
import UserPages from "./pages/UserPages";
import LogoutPage from "./pages/LogoutPage";

function App() {
  const [loading, setLoading] = useState(false);
  const authContext = useAuthAttributes();
  const user = authContext?.userAttributes;
  const isAuth = !!user;
  const userRole = user?.roleId;

  useEffect(() => {
    const hasLoadedThisSession = sessionStorage.getItem("breezy_loaded");

    if (!hasLoadedThisSession) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("breezy_loaded", "true");
      }, 2500);
    }
  }, []);

  return loading ? (
    <BreezyLoader />
  ) : (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuth ? <MainFrameSplit /> : <LoginPage />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route
            path="/profile"
            element={isAuth ? <MainFrameSplit /> : <LoginPage />}
          >
            <Route index element={<ProfilePage />} />
          </Route>

          <Route
            path="/profile/:userId"
            element={isAuth ? <MainFrameSplit /> : <LoginPage />}
          >
            <Route index element={<ProfilePage />} />
          </Route>

          <Route
            path="/messages"
            element={isAuth ? <MainFrameSplit /> : <LoginPage />}
          >
            <Route path=":id?" element={<MessagesPage />} />
          </Route>

          <Route
            path="/login"
            element={isAuth ? <NotFoundPage /> : <LoginPage />}
          />

          <Route
            path="/register"
            element={isAuth ? <NotFoundPage /> : <RegisterPage />}
          />

          <Route
            path="/search"
            element={isAuth ? <MainFrameSplit /> : <LoginPage />}
          >
            <Route index element={<UserSearchPage />} />
          </Route>

          <Route
            path="/logout"
            element={isAuth ? <LogoutPage /> : <LoginPage />}
          />

          <Route
            path="/users"
            element={isAuth ? <MainFrameSplit /> : <LoginPage />}
          >
            <Route index element={<UserPages />} />
          </Route>

          <Route
            path="/forgot-password"
            element={isAuth ? <NotFoundPage /> : <PasswordRecoveryPage />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
