import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast'; // ou votre librairie de toast
import { useAuthAttributes } from "../context/AuthAttributsContext";
import { userFollowings, unfollowUser } from '../api/modules/users';

function RightFrame() {
  const navigate = useNavigate();
  const authContext = useAuthAttributes();
  const user = authContext?.userAttributes;
  const isAuth = !!user;

  const [followings, setFollowings] = useState([]);
  const [unfollowingUsers, setUnfollowingUsers] = useState(new Set());

  useEffect(() => {
    if (isAuth) {
      fetchFollowings();
    }
  }, [isAuth]);

const fetchFollowings = async () => {
  try {
    const followings = await userFollowings();
    const users = followings.map(following => ({
      id: following.id,
      username: following.username,
      avatar: following.profile_picture, //TODO
    }));

    setFollowings(users);
  } catch (error) {
    console.error('Error fetching followings:', error);
  }
};


  const handleUserClick = (userId, event) => {
    // Empêcher la navigation si on clique sur le bouton unfollow
    if (event.target.closest('button')) {
      event.stopPropagation();
      return;
    }
    navigate(`/profile/${userId}`);
  };

  const handleUnfollowUser = async (userId, username, event) => {
    event.stopPropagation(); // Empêcher la propagation vers le clic sur l'utilisateur
    
    try {
      setUnfollowingUsers(prev => new Set([...prev, userId]));
      
      await unfollowUser(userId);
      
      toast.success(`Vous ne suivez plus ${username}`, { 
        position: 'top-center', 
        duration: 3000 
      });
      
      // Recharger la liste des followings
      await fetchFollowings();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Erreur lors du désabonnement : " + error.message, { 
        position: 'top-center', 
        duration: 3000 
      });
    } finally {
      setUnfollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <aside className="rounded-2xl shadow-md p-6 w-full bg-white bg-opacity-50 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-5 text-gray-900 tracking-wide">Comptes suivis</h2>
      <ul className="list-none p-0 m-0">
        {isAuth ? (
          followings.length > 0 ? (
            followings.map(account => {
              const isUnfollowing = unfollowingUsers.has(account.id);
              
              return (
                <li
                  key={account.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 gap-4 last:border-b-0 cursor-pointer hover:bg-gray-50 hover:bg-opacity-70 transition-colors duration-200 rounded-lg px-2"
                  onClick={(event) => handleUserClick(account.id, event)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={account.avatar ? `data:image/jpg;base64,${account.avatar}` : "/assets/default.png"}
                      alt={account.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-base text-left hover:text-blue-600 transition-colors max-w-[120px] truncate">
                        {account.username.length > 5 ? `${account.username.slice(0, 3)}...` : account.username}
                      </div>
                    </div>
                  </div>
                  
                  {/* Unfollow button with hover tooltip */}
                  <div className="group relative">
                    <button
                      onClick={(event) => handleUnfollowUser(account.id, account.username, event)}
                      disabled={isUnfollowing}
                      className={`text-gray-500 hover:text-red-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isUnfollowing ? 'animate-pulse' : ''
                      }`}
                    >
                      <FontAwesomeIcon icon={faUserMinus} />
                    </button>
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10 whitespace-nowrap">
                      {isUnfollowing ? 'Désabonnement...' : 'Se désabonner'}
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 text-center py-4">
              Vous ne suivez encore personne.
            </li>
          )
        ) : (
          <li className="text-gray-500 text-center py-4">
            Connectez-vous pour voir les comptes suivis.
          </li>
        )}
      </ul>
    </aside>
  );
}

export default RightFrame;