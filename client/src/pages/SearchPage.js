import { useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { searchUsers, followUser } from "../api/modules/users";
import { useAuthAttributes } from "../context/AuthAttributsContext";

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const authContext = useAuthAttributes();
  const user = authContext?.userAttributes;
  if (!user) {
    toast.error("Vous devez être connecté pour accéder à cette page");
    return null; // ou rediriger vers la page de connexion
  }

  const handleSearch = async (query) => {
    if (!query || query.trim() === "") {
      setFilteredUsers([]);
      return;
    }
    try {
      const results = await searchUsers(query);
      setFilteredUsers(results.filter((result) => result.username !== user?.username));
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      toast.success("Utilisateur suivé avec succès");
    } catch (error) {
      toast.error("Erreur lors du suivi de l'utilisateur");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen font-sans">
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
        <p className="text-gray-500 text-center">Aucun utilisateur trouvé</p>
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
                onClick={() => handleFollow(user.id)}
              >
                <UserPlusIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}
