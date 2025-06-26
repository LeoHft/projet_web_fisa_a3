import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userFollowers, userFollowings, getUser, editProfileImage, editBio } from '../api/modules/users'
import { getUserPosts, getUserComments, updatePost, deletePost } from '../api/modules/posts'
import { useAuthAttributes } from "../context/AuthAttributsContext";
import toast, { Toaster } from 'react-hot-toast';
import BreezyLoader from '../components/BreezyLoader'
import OptionsButton from "../components/optionsButton";

function ProfilePage() {
    const { userId } = useParams(); // Récupère l'ID de l'utilisateur depuis l'URL
    const authContext = useAuthAttributes();
    const currentUser = authContext?.userAttributes;
    const isOwnProfile = !userId || (currentUser && userId == currentUser.id);

    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('posts') // 'posts' ou 'comments'
    const [openMenuPostId, setOpenMenuPostId] = useState(null);

    const [user, setUser] = useState({
        username: "",
        bio: "",
        profileImage: "",
        posts: [],
        comments: [],
        nbr_followers: 0,
        nbr_following: 0,
    });

    useEffect(() => {
        userFollowersFunction();
        userFollowingsFunction();
        userDataFunction();
        // Charger les posts par défaut
        getUserPostsFunction();
    }, [userId]); // Recharger quand l'userId change

    const userDataFunction = () => {
        setIsLoading(true)
        try {
            // Passer l'userId si ce n'est pas le profil de l'utilisateur connecté
            const userPromise = isOwnProfile ? getUser() : getUser(userId);

            userPromise
                .then(response => {
                    setUser(prevUser => ({
                        ...prevUser,
                        username: response.username,
                        bio: response.bio,
                        profileImage: response.image
                    }));
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                })
                .finally(() => setIsLoading(false));
        } catch (error) {
            console.error('Error in userDataFunction:', error);
            setIsLoading(false);
        }
    }

    const userFollowersFunction = () => {
        setIsLoading(true)
        try {
            userFollowers(isOwnProfile ? null : userId)
                .then(response => {
                    setUser(prevUser => ({
                        ...prevUser,
                        nbr_followers: response.followersCount
                    }));
                })
                .catch(error => {
                    console.error('Error fetching followers:', error);
                })
                .finally(() => setIsLoading(false));
        } catch (error) {
            console.error('Error in userFollowersFunction:', error);
            setIsLoading(false);
        }
    }

    const userFollowingsFunction = () => {
        setIsLoading(true)
        try {
            userFollowings(isOwnProfile ? null : userId)
                .then(response => {
                    setUser(prevUser => ({
                        ...prevUser,
                        nbr_following: response.followingsCount
                    }));
                })
                .catch(error => {
                    console.error('Error fetching following:', error);
                })
                .finally(() => setIsLoading(false));
        } catch (error) {
            console.error('Error in userFollowingsFunction:', error);
            setIsLoading(false);
        }
    }

    const getUserPostsFunction = () => {
        setIsLoading(true)
        try {
            const postsPromise = isOwnProfile ? getUserPosts() : getUserPosts(userId);

            postsPromise
                .then(response => {
                    setUser(prevUser => ({
                        ...prevUser,
                        posts: response.posts || [],
                    }));
                })
                .catch(error => {
                    console.error('Error fetching user posts:', error);
                    toast.error(error.message, { position: 'top-center', duration: 3000 });
                })
                .finally(() => setIsLoading(false));
        } catch (error) {
            console.error('Error in getUserPostsFunction:', error);
            toast.error(error.message, { position: 'top-center', duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    }

    const getUserCommentsFunction = () => {
        setIsLoading(true)
        try {
            const commentsPromise = isOwnProfile ? getUserComments() : getUserComments(userId);

            commentsPromise
                .then(response => {
                    setUser(prevUser => ({
                        ...prevUser,
                        comments: response.comments || [],
                    }));
                })
                .catch(error => {
                    console.error('Error fetching user comments:', error);
                    toast.error(error.message, { position: 'top-center', duration: 3000 });
                })
                .finally(() => setIsLoading(false));
        } catch (error) {
            console.error('Error in getUserCommentsFunction:', error);
            toast.error(error.message, { position: 'top-center', duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    }

    const editUserProfileImage = (file) => {
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64Image = reader.result.split(",")[1]; // retire le préfixe "data:image/jpeg;base64,..."
            try {
                await editProfileImage(base64Image);
                toast.success("Image de profil mise à jour !");
                userDataFunction(); // Recharger l'image
            } catch (error) {
                toast.error("Erreur lors de la mise à jour de l'image");
                console.error(error);
            }
        };

        if (file) {
            reader.readAsDataURL(file); // déclenche onloadend
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            editUserProfileImage(file);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'posts' && user.posts.length === 0) {
            getUserPostsFunction();
        } else if (tab === 'comments' && user.comments.length === 0) {
            getUserCommentsFunction();
        }
    }

    /* Update Post Section */
    const [UpdateModalOpen, setUpdatePostModalOpen] = useState(false);
    const [updateText, setUpdateText] = useState("");
    const [editId, setUpdateId] = useState(null);
    const [type, setType] = useState(null);
    const validUpdate = () => {
        updatePost(editId, updateText, type);
    }
    const validUpdateBio = () => {
        editBio(updateText, type);
    }

    if (isLoading) {
        return <BreezyLoader />
    }

    return (
        <div className="min-h-screen font-sans p-6">
            <div className="max-w-xl mx-auto rounded-2xl shadow-md mb-6 overflow-hidden w-[90vw]">
                {/* Header with background */}
                <div className="bg-[#1da1f2] py-6 px-[5vw] text-center relative ">
                    <img
                        src={user.profileImage.image ? `data:image/jpg;base64,${user.profileImage.image}` : "/assets/default.png"}
                        alt={user.profileImage}
                        className="w-[20vw] max-w-[120px] h-[20vw] max-h-[120px] rounded-full border-4 border-white object-cover mb-4 shadow-md mx-auto"
                    />

                    {isOwnProfile && (
                        <label className="block mx-auto mt-4 w-fit cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200">
                            Modifier la photo de profil (choisir une image au format .jpg)
                            <input
                                type="file"
                                accept=".jpg"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* User info */}
                <div className="px-[5vw] pt-4 pb-6 text-center bg-white bg-opacity-50 backdrop-blur-md">
                    <h2 className="m-0 mb-1 font-extrabold text-[clamp(18px,2.5vw,24px)] text-[#14171a]">
                        {user.username}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <p className="m-0 text-[#14171a] leading-snug text-[clamp(14px,2vw,16px)]">
                            {user.bio}
                        </p>
                        {currentUser.username === user.username && (
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setType(4);
                                setUpdatePostModalOpen(true);
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="mt-4 flex justify-center gap-6 text-[#657786] text-[clamp(13px,2vw,16px)]">
                        <span>
                            <strong>{!user.nbr_followers || user.nbr_followers < 1 ? 0 : user.nbr_followers}</strong> Followers
                        </span>
                        <span>
                            <strong>{!user.nbr_following || user.nbr_following < 1 ? 0 : user.nbr_following}</strong> Following
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="max-w-xl mx-auto mb-6 w-[90vw]">
                <div className="flex rounded-xl overflow-hidden shadow-md bg-white bg-opacity-50 backdrop-blur-md">
                    <button
                        onClick={() => handleTabChange('posts')}
                        className={`flex-1 py-3 px-4 text-center font-bold transition-colors ${activeTab === 'posts'
                            ? 'bg-[#1da1f2] text-white'
                            : 'text-[#657786] hover:bg-gray-100'
                            }`}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => handleTabChange('comments')}
                        className={`flex-1 py-3 px-4 text-center font-bold transition-colors ${activeTab === 'comments'
                            ? 'bg-[#1da1f2] text-white'
                            : 'text-[#657786] hover:bg-gray-100'
                            }`}
                    >
                        Commentaires
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div>
                {activeTab === 'posts' ? (
                    // Posts Section
                    <div>
                        <h3 className="ml-2 mb-4 text-[#14171a] text-lg font-extrabold">Posts</h3>
                        {user.posts.length === 0 ? (
                            <div className="rounded-xl p-6 text-center text-[#657786] shadow-md bg-white bg-opacity-50 backdrop-blur-md">
                                Aucun post pour le moment.
                            </div>
                        ) : (
                            user.posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="rounded-xl shadow-md p-5 mb-4 flex flex-col transition-shadow bg-white bg-opacity-50 backdrop-blur-md relative"
                                >

                                    <div className="absolute top-4 right-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setType(1);
                                                setOpenMenuPostId(openMenuPostId === post.id ? null : post.id); // toggle menu
                                            }}
                                            className="w-5 h-5 text-gray-500 hover:text-gray-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                                            </svg>
                                        </button>
                                        {openMenuPostId === post.id && type === 1 && (
                                            <OptionsButton
                                                type="post"
                                                onEdit={() => {
                                                    setUpdatePostModalOpen(true);
                                                    setUpdateId(post.id);
                                                    setUpdateText(post.content);
                                                }}
                                                onDelete={() => {
                                                    deletePost(post.id, type);
                                                }}
                                            />
                                        )}
                                    </div>
                                    {/* Contenu du post */}
                                    <div className="flex items-center mb-3">
                                        <img
                                            src={user.profileImage.image ? `data:image/jpg;base64,${user.profileImage.image}` : "/assets/default.png"}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                        />
                                        <div>
                                            <div className="font-bold text-[15px]">{user.username}</div>
                                            <div className="text-[13px] text-[#657786]">{post.updatedAt}</div>
                                        </div>
                                    </div>
                                    <div className="text-[15px] text-[#14171a] mt-1 mb-1 leading-snug pl-[52px]">
                                        {post.content}
                                    </div>
                                </div>

                            ))
                        )}
                    </div>
                ) : (
                    // Comments Section
                    <div>
                        <h3 className="ml-2 mb-4 text-[#14171a] text-lg font-extrabold">Commentaires</h3>
                        {user.comments.length === 0 ? (
                            <div className="rounded-xl p-6 text-center text-[#657786] shadow-md bg-white bg-opacity-50 backdrop-blur-md">
                                Aucun commentaire pour le moment.
                            </div>
                        ) : (
                            user.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="rounded-xl shadow-md p-5 mb-4 flex flex-col transition-shadow bg-white bg-opacity-50 backdrop-blur-md"
                                >
                                    <div className="absolute top-4 right-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuPostId(openMenuPostId === comment.id ? null : comment.id); // toggle menu
                                                setType(2);
                                            }}
                                            className="w-5 h-5 text-gray-500 hover:text-gray-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                                            </svg>
                                        </button>
                                        {openMenuPostId === comment.id && type === 2 && (
                                            <OptionsButton
                                                type="comment"
                                                onEdit={() => {
                                                    setUpdatePostModalOpen(true);
                                                    setUpdateId(comment.id);
                                                    setUpdateText(comment.content);
                                                }}
                                                onDelete={() => {
                                                    deletePost(comment.id, type);
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center mb-3">
                                        <img
                                            src={user.profileImage.image ? `data:image/jpg;base64,${user.profileImage.image}` : "/assets/default.png"}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                        />
                                        <div>
                                            <div className="font-bold text-[15px]">{user.username}</div>
                                            <div className="text-[13px] text-[#657786]">{comment.updatedAt}</div>
                                        </div>
                                    </div>
                                    <div className="text-[15px] text-[#14171a] mt-1 mb-1 leading-snug pl-[52px]">
                                        {comment.content}
                                    </div>
                                    {comment.postTitle && (
                                        <div className="text-[13px] text-[#657786] mt-2 pl-[52px] italic">
                                            En réponse au post: "{comment.postTitle}"
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {UpdateModalOpen && type === 1 && (
                <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm transition-all duration-300">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        aria-hidden="true"
                        onClick={() => setUpdatePostModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 animate-[modalEnter_0.3s_ease-out_forwards]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Modifier le post
                                    </h2>
                                    <button
                                        onClick={() => setUpdatePostModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
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
                                <p className="mt-1 text-gray-500">
                                    Modifier votre post.
                                </p>
                            </div>

                            {/* Champ de commentaire */}
                            <div className="px-6 py-4">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition placeholder-gray-400 bg-gray-50"
                                    placeholder="Text du post...."
                                    value={updateText}
                                    onChange={(e) => setUpdateText(e.target.value)}
                                    maxLength={200}
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setUpdatePostModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => validUpdate()}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Valider
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {UpdateModalOpen && type === 2 && (
                <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm transition-all duration-300">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        aria-hidden="true"
                        onClick={() => setUpdatePostModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 animate-[modalEnter_0.3s_ease-out_forwards]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Modifier le commentaire
                                    </h2>
                                    <button
                                        onClick={() => setUpdatePostModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
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
                                <p className="mt-1 text-gray-500">
                                    Modifier votre commentaire.
                                </p>
                            </div>

                            {/* Champ de commentaire */}
                            <div className="px-6 py-4">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition placeholder-gray-400 bg-gray-50"
                                    placeholder="Text du commentaire...."
                                    value={updateText}
                                    onChange={(e) => setUpdateText(e.target.value)}
                                    maxLength={200}
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setUpdatePostModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => validUpdate()}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Valider
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {UpdateModalOpen && type === 4 && (
                <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm transition-all duration-300">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        aria-hidden="true"
                        onClick={() => setUpdatePostModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 animate-[modalEnter_0.3s_ease-out_forwards]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Modifier votre Bio
                                    </h2>
                                    <button
                                        onClick={() => setUpdatePostModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
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
                                <p className="mt-1 text-gray-500">
                                    Modifier votre biographie de compte.
                                </p>
                            </div>

                            {/* Champ de commentaire */}
                            <div className="px-6 py-4">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition placeholder-gray-400 bg-gray-50"
                                    placeholder="Je vie d'amour et d'eau fraiche..."
                                    value={updateText}
                                    onChange={(e) => setUpdateText(e.target.value)}
                                    maxLength={200}
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setUpdatePostModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => validUpdateBio()}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Valider
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toaster />
        </div>
    );
}

export default ProfilePage;