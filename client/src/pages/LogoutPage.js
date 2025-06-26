import { useEffect } from "react";

const LogoutPage = () => {
  useEffect(() => {
    console.log("Déconnexion...");
    localStorage.removeItem("token");

    // Recharger complètement l'application après 300ms pour forcer isAuth à false
    setTimeout(() => {
      window.location.href = "/login";
    }, 300);
  }, []);

  return null
};

export default LogoutPage;