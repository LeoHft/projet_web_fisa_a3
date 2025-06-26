import { useLocation, Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuthAttributes } from "../context/AuthAttributsContext";
import {
  HomeIcon,
  UserIcon,
  BellIcon,
  InboxIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { getFriends } from "../api/modules/users";

const NavigationAside = ({ navButtons }) => (
  <aside className="rounded-2xl shadow-md p-6 w-full flex flex-col items-center bg-white bg-opacity-50 backdrop-blur-md">
    <img src="/logo192.png" alt="Website Logo" className="w-20 h-20 mb-4" />
    <h2 className="text-2xl font-bold mb-2 text-gray-900 tracking-wide">
      Breezy
    </h2>
    <nav className="w-full">
      {navButtons.map((btn) => (
        <a
          key={btn.label}
          href={btn.link}
          className="block w-full py-3 text-center text-gray-800 font-bold rounded-md my-1 transition-colors duration-200 hover:bg-gray-200"
        >
          {btn.label}
        </a>
      ))}
    </nav>
  </aside>
);

const MessagesAside = ({ mockFriends }) => (
<aside className="rounded-2xl shadow-md p-4 sm:p-6 w-full max-w-xs bg-white bg-opacity-50 backdrop-blur-md flex flex-col h-[calc(100vh-150px)]">
  <p className="text-gray-700 mb-4 text-center text-base sm:text-lg font-semibold">
    Messages
  </p>

  {/* Liste scrollable */}
<div className="overflow-y-auto space-y-2 pr-1" style={{ maxHeight: '125px' }}>
    {mockFriends.map((friend) => (
      <Link
        to={`/messages/${friend.id}`}
        key={friend.id}
        className="flex items-center gap-4 p-3 rounded-xl bg-white hover:bg-gray-50 hover:shadow transition-all duration-200 border border-gray-200"
      >
        <img 
          src={friend.profile_picture ? `data:image/jpg;base64,${friend.profile_picture}` : "/assets/default.png"}
          alt={friend.username}
          className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 truncate">{friend.username}</div>
        </div>
      </Link>
    ))}

    {mockFriends.length === 0 && (
      <p className="text-gray-500 text-center mt-4">Aucun ami trouvé</p>
    )}
  </div>
</aside>
);

const FriendsDrawer = ({ isOpen, onClose, friends, onSelectFriend, mockFriends }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 md:hidden ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 z-50 md:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {" "}
              Debutter une conversation
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Choisissez un ami pour commencer la conversation
          </p>
        </div>

        {/* Friends List */}
        <div className="overflow-y-auto flex-1 px-2" >
          {mockFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-[#45668e] bg-opacity-20 rounded-full flex items-center justify-center">
                  <img 
                    src={friend.profile_picture ? `data:image/jpg;base64,${friend.profile_picture}` : "/assets/default.png"}
                    alt={friend.username}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
                  />
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{friend.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const iconMap = {
  Home: <HomeIcon className="w-5 h-5 mb-1" />,
  Rechercher: <MagnifyingGlassIcon className="w-5 h-5 mb-1" />,
  Utilisateurs: <UserIcon className="w-5 h-5 mb-1" />,
  Notifications: <BellIcon className="w-5 h-5 mb-1" />,
  Messages: <InboxIcon className="w-5 h-5 mb-1" />,
  Profil: <UserIcon className="w-5 h-5 mb-1" />,
  Inscription: <UserIcon className="w-5 h-5 mb-1" />,
  Deconnexion: <UserMinusIcon className="w-5 h-5 mb-1" />,
};

const MobileNav = ({ navButtons, mockFriends }) => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Helper to check if the current nav button is active
  const isActive = (link) => {
    if (link === "/") return location.pathname === "/";
    return location.pathname.startsWith(link);
  };

  const isMessagesPage = location.pathname.startsWith("/messages");

  const handleSelectFriend = (friend) => {
    navigate(`/messages/${friend.id}`);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white bg-opacity-50 backdrop-blur-md border-t shadow-inner flex justify-around z-50 py-2">
        {navButtons.map((btn) => {
          const active = isActive(btn.link);
          return (
            <Link
              key={btn.label}
              to={btn.link}
              className={`flex flex-col items-center text-xs hover:text-black ${
                active ? "text-blue-600 font-bold" : "text-gray-700"
              }`}
            >
              <span
                className={`flex items-center justify-center mb-1 w-8 h-8 rounded-full transition ${
                  active ? "bg-blue-100" : ""
                }`}
              >
                {iconMap[btn.label] || <UserIcon className="w-5 h-5" />}
              </span>
              <span>{btn.label}</span>
            </Link>
          );
        })}

        {isMessagesPage && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center text-xs text-gray-700 hover:text-black"
          >
            <span className="flex items-center justify-center mb-1 w-8 h-8 rounded-full transition hover:bg-gray-100">
              <EnvelopeIcon className="w-5 h-5" />
            </span>
            <span>Amis</span>
          </button>
        )}
      </div>

      <FriendsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        friends={mockFriends}
        onSelectFriend={handleSelectFriend}
        mockFriends={mockFriends}
      />
    </>
  );
};

const LeftFrame = () => {
  const authContext = useAuthAttributes();
  const user = authContext?.userAttributes;
  const isAuth = !!user;
  const isAdmin = user?.roleId === 1;
  const [mockFriends, setMockFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendsData = await getFriends();
        setMockFriends(friendsData);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, []);

  const navButtons = [
    { label: "Home", link: "/" },
    { label: "Rechercher", link: "/search" },
    ...(isAuth ? [] : [{ label: "Creer un compte", link: "/register" }]),
    ...(isAuth ? [{ label: "Messages", link: "/messages" }] : []),
    ...(isAuth ? [{ label: "Profile", link: "/profile" }] : []),
    ...(isAuth ? [] : [{ label: "Connexion", link: "/login" }]),
    ...(isAuth ? [{ label: "Deconnexion", link: "/logout" }] : []),
    ...(isAdmin ? [{ label: "Utilisateurs", link: "/users" }] : []),
  ];

  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:flex flex-col gap-4 w-full">
        <NavigationAside navButtons={navButtons} />
        {isMessagesPage && <MessagesAside mockFriends={mockFriends} />}
      </div>

      {/* Mobile view */}
      <MobileNav navButtons={navButtons} mockFriends={mockFriends} />
    </>
  );
};

export default LeftFrame;
