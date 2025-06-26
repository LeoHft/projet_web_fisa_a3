import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  CheckIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import {
  searchValidateUsers,
  validateUser,
  searchBanUsers,
  banUser,
  createUser,
} from "../api/modules/users";
import { useAuthAttributes } from "../context/AuthAttributsContext";

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredBanUsers, setFilteredBanUsers] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState("validateUsers");
  const [errorMessage, setErrorMessage] = useState("");

  const authContext = useAuthAttributes();
  const user = authContext?.userAttributes;

  const handleSearch = async (query) => {
    try {
      const results = await searchValidateUsers(query);
      setFilteredUsers(
        results.filter((result) => result.username !== user?.username)
      );
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      toast.success("Utilisateur créé avec succès");
    } catch (error) {
      setErrorMessage(error.message);
      toast.error("Erreur lors de la création de l'utilisateur");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleBanSearch = async (query) => {
    try {
      const results = await searchBanUsers(query);
      setFilteredBanUsers(
        results.filter((result) => result.username !== user?.username)
      );
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    }
  };

  useEffect(() => {
    handleSearch("");
    handleBanSearch("");
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen font-sans">
      {/* Tabs */}
      <div className="container mx-auto max-w-xl mb-6">
        <div className="flex rounded-xl overflow-x-auto shadow-md bg-white bg-opacity-80 backdrop-blur-md">
          <button
            onClick={() => setSelectedWidget("validateUsers")}
            className={`flex-1 py-3 px-4 font-bold transition-colors whitespace-nowrap ${
              selectedWidget === "validateUsers"
                ? "bg-[#1da1f2] text-white"
                : "text-[#657786] hover:bg-gray-100"
            }`}
          >
            Utilisateurs à valider
          </button>
          <button
            onClick={() => setSelectedWidget("bannedUsers")}
            className={`flex-1 py-3 px-4 font-bold transition-colors whitespace-nowrap ${
              selectedWidget === "bannedUsers"
                ? "bg-[#1da1f2] text-white"
                : "text-[#657786] hover:bg-gray-100"
            }`}
          >
            Utilisateurs à bannir
          </button>

          <button
            onClick={() => setSelectedWidget("CreateUser")}
            className={`flex-1 py-3 px-4 font-bold transition-colors whitespace-nowrap ${
              selectedWidget === "CreateUser"
                ? "bg-[#1da1f2] text-white"
                : "text-[#657786] hover:bg-gray-100"
            }`}
          >
            Creer un utilisateur
          </button>
        </div>
      </div>

      {selectedWidget === "validateUsers" ? (
        <>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-500" />
            Recherche d'utilisateurs
          </h1>

          {/* Barre de recherche */}
          <form
            className="mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (filteredUsers.length === 0) {
                toast.error("Utilisateur non trouvé");
              }
            }}
          >
            <div className="relative max-w-xl mx-auto">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white bg-opacity-60 backdrop-blur-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                autoFocus
              />
            </div>
          </form>

          {/* Liste des utilisateurs */}
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center">
              Aucun utilisateur trouvé
            </p>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="shadow rounded-xl p-4 flex items-center gap-4 bg-white bg-opacity-50 backdrop-blur-md hover:shadow-md transition justify-between"
                >
                  <div className="flex text-start gap-4">
                    <img
                      src={user.profile_picture ? `data:image/jpg;base64,${user.profile_picture}` : "/assets/default.png"} 
                      alt={user.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div>
                      <div className="font-semibold text-lg text-[#14171a]">
                        {user.username}
                      </div>
                      <div className="text-gray-600">{user.bio}</div>
                    </div>
                  </div>
                  <button
                    className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white hover:bg-blue-700 transition"
                    onClick={() => validateUser(user.id)}
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : selectedWidget === "bannedUsers" ? (
        <>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-500" />
            Recherche d'utilisateurs bannis
          </h1>

          {/* Barre de recherche ban */}
          <form
            className="mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (filteredBanUsers.length === 0) {
                toast.error("Utilisateur non trouvé");
              }
            }}
          >
            <div className="relative max-w-xl mx-auto">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white bg-opacity-60 backdrop-blur-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleBanSearch(e.target.value);
                }}
                autoFocus
              />
            </div>
          </form>

          {/* Liste des utilisateurs ban */}
          {filteredBanUsers.length === 0 ? (
            <p className="text-gray-500 text-center">
              Aucun utilisateur trouvé
            </p>
          ) : (
            <div className="space-y-4">
              {filteredBanUsers.map((user) => (
                <div
                  key={user.id}
                  className="shadow rounded-xl p-4 flex items-center gap-4 bg-white bg-opacity-50 backdrop-blur-md hover:shadow-md transition justify-between"
                >
                  <div className="flex text-start gap-4">
                    <img
                      src={user.profile_picture ? `data:image/jpg;base64,${user.profile_picture}` : "/assets/default.png"}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div>
                      <div className="font-semibold text-lg text-[#14171a]">
                        {user.username}
                      </div>
                      <div className="text-gray-600">{user.bio}</div>
                    </div>
                  </div>
                  <button
                    className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white hover:bg-blue-700 transition"
                    onClick={() => banUser(user.id)}
                  >
                    <NoSymbolIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <form className="space-y-4 max-w-md mx-auto">
          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Erreur :</strong>
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col">
            <label htmlFor="username" className="text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              className="block w-full px-4 py-2 rounded-xl border border-gray-300 bg-white bg-opacity-60 backdrop-blur-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Nom d'utilisateur"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="role" className="text-gray-700 mb-2">
              Rôle
            </label>
            <select
              id="role"
              className="block w-full px-4 py-2 rounded-xl border border-gray-300 bg-white bg-opacity-60 backdrop-blur-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderateur</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="block w-full px-4 py-2 rounded-xl border border-gray-300 bg-white bg-opacity-60 backdrop-blur-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Email"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              className="block w-full px-4 py-2 rounded-xl border border-gray-300 bg-white bg-opacity-60 backdrop-blur-md text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Mot de passe"
              required
            />
          </div>
          <button
            className="w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition"
            onClick={(e) => {
              e.preventDefault();
              const userData = {
                username: document.getElementById("username").value,
                role: document.getElementById("role").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
              };
              handleCreateUser(userData);
            }}
          >
            Soumettre
          </button>
        </form>
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
