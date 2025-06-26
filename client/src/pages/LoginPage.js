import React, { useState } from "react";
import {
  windyBg,
  loginBox,
  inputStyle,
  buttonStyle,
} from "../styles/WindyStyle";
import { login } from "../api/modules/users";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthAttributes } from "../context/AuthAttributsContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useAuthAttributes();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password)
      .then((response) => {
        console.log("Login successful:", response);
        toast.success(response.message, {
          position: "top-center",
          duration: 3000,
        });
        if (response.token) {
          localStorage.setItem("token", response.token);
        }
        authContext.FetchUserAttributes(); // On recharge les attributs de l'utilisateur à la place de recharger la page
        navigate("/");
      })
      .catch((error) => {
        console.error("Login failed:", error);
        toast.error(error.message || "Erreur inconnue", {
          position: "top-center",
          duration: 3000,
        });
      });

    console.log("Login attempt with email:", email, "and password:", password);
  };

  return (
    <div style={windyBg}>
      <form style={loginBox} onSubmit={handleSubmit}>
        <h2
          style={{
            fontFamily: "Segoe UI, sans-serif",
            marginBottom: "1.5rem",
            color: "#66a6ff",
            letterSpacing: "2px",
          }}
        >
          Breezy Connexion
        </h2>
        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={buttonStyle} type="submit">
          Connexion
        </button>

        {/* Register and Forgot Password links */}
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <a
            href="/register"
            style={{
              color: "#66a6ff",
              textDecoration: "none",
              marginRight: "1rem",
            }}
          >
            S'inscrire
          </a>
          <a
            href="/forgot-password"
            style={{ color: "#66a6ff", textDecoration: "none" }}
          >
            Mot de passe oublié ?
          </a>
        </div>
      </form>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "16px",
          },
          duration: 3000,
        }}
      />
    </div>
  );
}
