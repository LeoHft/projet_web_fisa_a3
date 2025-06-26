import React, { useState, useEffect, use } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faThumbsUp,
  faComment,
  faShare,
  faUserMinus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthAttributes } from "../context/AuthAttributsContext";
import {
  createPost,
  getFollowingUsersPosts,
  createComment,
  getPostComments,
  updatePost,
  deletePost,
  toggleLikePost
} from "../api/modules/posts";
import { unfollowUser, getUser } from "../api/modules/users";
import toast, { Toaster } from "react-hot-toast";
import { Router } from "react-router-dom";
import { getFriends } from "../api/modules/users";
import { sharePost } from "../api/modules/messages";
import { useNavigate } from "react-router-dom";
import OptionsButton from "../components/optionsButton";

library.add(faThumbsUp, faComment, faShare, faUserMinus, faTimes);

function generateRandomPostContent() {
  const randomContents = [
    "Je viens de finir un super livre !",
    "Quelqu'un a des recommandations de films ?",
    "J'ai découvert une nouvelle recette délicieuse !",
    "Aujourd'hui, j'ai fait une belle randonnée.",
    "J'adore le nouveau café qui a ouvert en ville.",
    "Quelqu'un veut se joindre à moi pour un jeu vidéo ce soir ?",
    "J'ai commencé à apprendre la guitare, c'est génial !",
    "Qui est partant pour un café demain ?",
    "J'ai vu un documentaire fascinant sur la nature.",
    "Je suis en train de planifier mes prochaines vacances.",
  ];
  return randomContents[Math.floor(Math.random() * randomContents.length)];
}

const postPlaceholder = "Quoi de neuf? Exemple: " + generateRandomPostContent();

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentsShown, setCommentsShown] = useState({}); // { postId: number }
  const [replyingTo, setReplyingTo] = useState(null); // { postId: number, commentId: number, replyToUsername: string, isReplyToReply: boolean, replyId: number }
  const [replyText, setReplyText] = useState("");
  const [unfollowingUsers, setUnfollowingUsers] = useState(new Set()); // Pour gérer l'état de chargement
  const [creatingComment, setCreatingComment] = useState(false); // Nouvel état pour le chargement des commentaires
  const [loadingComments, setLoadingComments] = useState({}); // État pour le chargement des commentaires par post
  const authContext = useAuthAttributes();
  const user = authContext?.userAttributes;
  const isAuth = !!user;
  const userRole = user?.roleId;
  const [friends, setFriends] = useState([]);
  const [sharePostModalOpen, setSharePostModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [shareText, setShareText] = useState("");
  const navigate = useNavigate();
  // Charger les posts au chargement du composant
  useEffect(() => {
    if (isAuth) {
      loadPosts();
    }
  }, [isAuth]);

  useEffect(() => {
    const fetchData = async () => {
      const friendsData = await getFriends();
      setFriends(friendsData);
    };

    fetchData();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getFollowingUsersPosts();

      if (!postsData) {
        return console.log("Aucun post trouvé");
      }

      // Transformer les données API en format compatible avec l'interface
      const transformedPosts = postsData.map((post) => ({
        id: post.id,
        userId: post.userId, // Ajout de l'ID utilisateur pour pouvoir unfollow
        author: post.username,
        content: post.content,
        timestamp: post.updatedAt,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        isLikedByCurrentUser: post.isLikedByCurrentUser,
        profile_picture: post.profile_picture,
        comments: [], // Les commentaires sont chargés après
      }));

      setPosts(transformedPosts);

      // Charger les commentaires pour tous les posts qui en ont
      const postsWithComments = transformedPosts.filter(
        (post) => post.commentCount > 0
      );

      if (postsWithComments.length > 0) {
        // Charger les commentaires en parallèle pour tous les posts
        await Promise.all(
          postsWithComments.map((post) => loadPostComments(post.id))
        );

      }

    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error(error.response?.data?.message || error.message, {
        position: "top-center",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les commentaires d'un post
  const loadPostComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));

      // Charger les commentaires principaux (parentId = null)
      const mainComments = await getPostComments(postId, null);


      // Pour chaque commentaire principal, charger ses réponses
      const commentsWithReplies = await Promise.all(
        mainComments.map(async (comment) => {
          try {
            const replies = await getPostComments(postId, comment.id);
            return {
              id: comment.id,
              author: comment.username,
              content: comment.content,
              timestamp: comment.updatedAt,
              profile_picture: comment.profile_picture,
              replies: replies.map((reply) => ({
                id: reply.id,
                author: reply.username || `User ${reply.userId}`,
                content: reply.content,
                timestamp: reply.updatedAt,
                profile_picture: reply.profile_picture,
              })),
            };
          } catch (error) {
            console.error(
              `Error loading replies for comment ${comment.id}:`,
              error
            );
            return {
              id: comment.id,
              author: comment.username || `User ${comment.userId}`,
              content: comment.content,
              timestamp: comment.updatedAt,
              replies: [],
            };
          }
        })
      );

      // Mettre à jour l'état avec les commentaires chargés
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: commentsWithReplies } : post
        )
      );

    } catch (error) {
      console.error("Error loading post comments:", error);
      toast.error(
        "Erreur lors du chargement des commentaires : " +
        (error.response?.data?.message || error.message),
        {
          position: "top-center",
          duration: 3000,
        }
      );
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };



  // Fonction pour basculer l'affichage des commentaires
  const toggleComments = async (postId) => {
    const post = posts.find((p) => p.id === postId);

    // Si les commentaires sont déjà chargés et affichés, les masquer
    if (post.comments && post.comments.length > 0) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? { ...p, comments: [] } : p))
      );
    } else {
      // Sinon, charger et afficher les commentaires
      await loadPostComments(postId);
    }
  };


  // Fonction pour gérer le désabonnement
  const handleUnfollowUser = async (userId, username) => {
    try {
      setUnfollowingUsers((prev) => new Set([...prev, userId]));

      await unfollowUser(userId);

      toast.success(`Vous ne suivez plus ${username}`, {
        position: "top-center",
        duration: 3000,
      });

      // Recharger les posts après désabonnement
      await loadPosts();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Erreur lors du désabonnement : " + error.message, {
        position: "top-center",
        duration: 3000,
      });
    } finally {
      setUnfollowingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };


  // Fonction pour partager un post avec un ami
  const handleShare = async (friendId, shareText) => {
    try {
      await sharePost(sharePostId, friendId, shareText);

      toast.success("Post partagé avec succès", {
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Erreur lors de la partage du post : " + error.message, {
        position: "top-center",
        duration: 3000,
      });
    }
  };


  // Prépare la réponse à un commentaire
  const handleReplyClick = (
    postId,
    commentId,
    replyToUsername = null,
    isReplyToReply = false,
    replyId = null
  ) => {
    setReplyingTo({
      postId,
      commentId,
      replyToUsername,
      isReplyToReply,
      replyId,
    });

    if (replyToUsername) {
      setReplyText(`@${replyToUsername} `);
    } else {
      setReplyText("");
    }
  };


  // Soumet une réponse à un commentaire (réponse à un commentaire existant)
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;

    try {
      setCreatingComment(true);

      let finalReplyText = replyText.trim();

      // Si c'est une réponse à une réponse (profondeur 2), assurer que le @username est présent
      if (replyingTo?.isReplyToReply && replyingTo?.replyToUsername) {
        if (!finalReplyText.startsWith(`@${replyingTo.replyToUsername}`)) {
          finalReplyText = `@${replyingTo.replyToUsername} ${finalReplyText}`;
        }
      } else if (
        replyingTo?.replyToUsername &&
        !finalReplyText.startsWith(`@${replyingTo.replyToUsername}`)
      ) {
        // Pour les réponses normales (profondeur 1)
        finalReplyText = `@${replyingTo.replyToUsername} ${finalReplyText}`;
      }

      // Appel API pour créer une réponse (commentaire avec parentId)
     await createComment(
        replyingTo.postId,
        replyingTo.commentId,
        finalReplyText
      );

      toast.success("Réponse ajoutée avec succès !", {
        position: "top-center",
        duration: 3000,
      });

      // Recharger les posts pour mettre à jour l'affichage
      await loadPosts();


      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error creating reply:", error);
      toast.error(
        "Erreur lors de la création de la réponse : " +
        (error.response?.data?.message || error.message),
        {
          position: "top-center",
          duration: 3000,
        }
      );
    } finally {
      setCreatingComment(false);
    }
  };


  const handleUserClick = (userId, event) => {
    // Empêcher la navigation si on clique sur le bouton unfollow
    if (event.target.closest("button")) {
      event.stopPropagation();
      return;
    }
    navigate(`/profile/${userId}`);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await createPost({
        content: newPost,
      });

      toast.success("Votre post a été publié avec succès !", {
        position: "top-center",
        duration: 3000,
      });

      setNewPost("");
      // Recharger les posts après création
      await loadPosts();


    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Erreur lors de la création du post : " + error.message, {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  const handleCommentClick = (postId) => {
    setCommentPostId(postId);
    setShowCommentModal(true);
    setCommentText("");
  };

  // Fonction pour créer un commentaire principal
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setCreatingComment(true);

      // Appel API pour créer un commentaire principal (sans parentId)
      await createComment(commentPostId, null, commentText);

      toast.success("Commentaire ajouté avec succès !", {
        position: "top-center",
        duration: 3000,
      });
      
      // Recharger les posts pour mettre à jour l'affichage
      await loadPosts();

      setShowCommentModal(false);
      setCommentPostId(null);
      setCommentText("");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error(
        "Erreur lors de la création du commentaire : " +
        (error.response?.data?.message || error.message),
        {
          position: "top-center",
          duration: 3000,
        }
      );
    } finally {
      setCreatingComment(false);
    }
  };

  const handleModalClose = () => {
    setShowCommentModal(false);
    setCommentPostId(null);
    setCommentText("");
  };

  const handleLoadMoreComments = (postId) => {
    setCommentsShown((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 3) + 3,
    }));
  };
  /* Update Post Section */
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [UpdateModalOpen, setUpdatePostModalOpen] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [editId, setUpdateId] = useState(null);
  const [type, setType] = useState(null);
  const validUpdate = () => {
    updatePost(editId, updateText, type);
  }


  //Fonction pour liker/unliker un post
  const handleLikeToogle = async (postId, isLiked) => {
    try {
      toggleLikePost(postId);
      loadPosts();
    } catch (err) {
      console.error('Erreur lors du toggle like :', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto border-gray-200 rounded-lg min-h-screen px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto border-gray-200 rounded-lg min-h-screen px-6">
      <Toaster />

      {/* Create Post */}
      {isAuth && (
        <form
          onSubmit={handlePost}
          className="flex flex-col mb-8 border-b border-gray-200 pb-4 rounded-xl shadow-md p-6 bg-white bg-opacity-50 backdrop-blur-md"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={postPlaceholder}
            rows={3}
            className="resize-none p-3 rounded-lg border border-gray-300 mb-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={!newPost.trim()}
            className="self-end bg-blue-500 text-white border-none rounded-full px-5 py-2 font-bold cursor-pointer shadow-sm hover:bg-blue-600 transition disabled:opacity-50"
          >
            Post
          </button>
        </form>
      )}

      {/* Posts List */}
      <div>
        {(posts === undefined || posts.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun post à afficher</p>
            <p className="text-gray-400 text-sm mt-2">
              Suivez des utilisateurs pour voir leurs posts
              <span
                className="text-blue-500 hover:underline cursor-pointer ml-1"
                onClick={() => Router.navigate("/search")}
              >
                ici.
              </span>
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const shown = commentsShown[post.id] || 3;
            const commentsToShow = post.comments
              ? post.comments.slice(0, shown)
              : [];

            const hasMore = post.comments && post.comments.length > shown;
            const isUnfollowing = unfollowingUsers.has(post.userId);

            return (
              <div
                key={post.id}
                className="rounded-2xl shadow-md p-6 mb-6 transition hover:shadow-xl duration-300 border border-gray-100 bg-white bg-opacity-50 backdrop-blur-md"
              >
                {post.author === user.username && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuPostId(openMenuPostId === post.id ? null : post.id); // toggle menu
                        setType(1);
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
                          deletePost(post.id, 1);
                        }}
                      />
                    )}
                  </div>
                )
                }

                <div className="flex items-start">
                  {/* Avatar */}
                  <div className="w-12 h-12 cursor-pointer rounded-full bg-gradient-to-br from-blue-200 to-blue-500 text-white flex items-center justify-center font-semibold text-lg mr-4 shadow-md" onClick={(e) => handleUserClick(post.userId, e)}>
                    <img
                      src={post.profile_picture ? `data:image/jpg;base64,${post.profile_picture}` : "/assets/default.png"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                  </div>

                  {/* Content Block */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-left">
                        <div className="text-gray-800 font-semibold text-md leading-tight cursor-pointer" onClick={(e) => handleUserClick(post.userId, e)}>
                          {post.author}
                        </div>
                        <div className="text-xs text-gray-400">
                          {post.timestamp}
                        </div>
                      </div>

                      {/* Unfollow button with hover tooltip */}
                      <div className="group relative">
                        <button
                          onClick={() =>
                            handleUnfollowUser(post.userId, post.author)
                          }
                          disabled={isUnfollowing}
                          className={`text-gray-500 hover:text-red-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isUnfollowing ? "animate-pulse" : ""
                            }`}
                        >
                          <FontAwesomeIcon icon={faUserMinus} />
                        </button>
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10">
                          {isUnfollowing ? "Désabonnement..." : "Se désabonner"}
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed text-left">
                      {post.content}
                    </p>

                    {/* Stats et bouton pour afficher/masquer les commentaires */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>{post.likeCount} j'aime</span>
                        <span>{post.commentCount} commentaires</span>
                      </div>

                      {post.commentCount > 0 && (
                        <button
                          onClick={() => toggleComments(post.id)}
                          disabled={loadingComments[post.id]}
                          className="text-xs text-blue-500 hover:text-blue-700 transition disabled:opacity-50"
                        >
                          {loadingComments[post.id]
                            ? "Chargement..."
                            : post.comments.length > 0
                              ? "Masquer les commentaires"
                              : "Voir les commentaires"}
                        </button>
                      )}
                    </div>

                    {/* Affichage des commentaires */}
                    {post.comments && post.comments.length > 0 && (

                      <div className="mt-4 border-t pt-3">
                        <div className="mb-2 text-xs text-gray-500 font-semibold">
                          Commentaires
                        </div>
                        {commentsToShow.map((comment) => (
                          <div
                            key={comment.id}
                            className="mb-2 flex items-start"
                          >
                            {comment.author === user.username && (
                              <div className="mb-3 flex items-start">
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
                            )}

                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mr-2">
                              <img
                                src={comment.profile_picture ? `data:image/jpg;base64,${comment.profile_picture}` : "/assets/default.png"}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
                              />
                            </div>
                            <div className="flex-1">
                              <div>
                                <div className="text-xs font-semibold text-gray-700 text-left">
                                  {comment.author}{" "}
                                  <span className="text-gray-400 font-normal">
                                    {comment.timestamp}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 text-left">
                                  {comment.content}
                                </div>
                              </div>

                              {/* Formulaire de réponse pour le commentaire principal */}
                              {replyingTo?.postId === post.id &&
                                replyingTo?.commentId === comment.id &&
                                !replyingTo?.isReplyToReply && (
                                  <form
                                    onSubmit={handleReplySubmit}
                                    className="mt-2 flex"
                                  >
                                    <input
                                      type="text"
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      placeholder="Écrire une réponse..."
                                      className="flex-1 text-xs p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
                                      disabled={creatingComment}
                                    />
                                    <button
                                      type="submit"
                                      disabled={
                                        creatingComment || !replyText.trim()
                                      }
                                      className="bg-blue-500 text-white text-xs px-3 rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {creatingComment ? "..." : "Envoyer"}
                                    </button>
                                  </form>
                                )}

                              {/* Bouton de réponse pour le commentaire principal */}
                              <button
                                onClick={() =>
                                  handleReplyClick(
                                    post.id,
                                    comment.id,
                                    comment.author,
                                    false,
                                    null
                                  )
                                }
                                className="text-xs text-gray-500 hover:text-blue-500 mt-1"
                                disabled={creatingComment}
                              >
                                Répondre
                              </button>

                              {/* Affichage des réponses */}
                              {comment.replies &&
                                comment.replies.length > 0 && (
                                  <div className="ml-4 mt-2 pl-2 border-l-2 border-gray-200">
                                    {comment.replies.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className="mb-2 flex items-start"
                                      >
                                        {reply.author === user.username && (
                                          <div className="mb-3 flex items-start">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuPostId(openMenuPostId === reply.id ? null : reply.id); // toggle menu
                                                setType(3);
                                              }}
                                              className="w-5 h-5 text-gray-500 hover:text-gray-700"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                                              </svg>
                                            </button>
                                            {openMenuPostId === reply.id && type === 3 && (
                                              <OptionsButton
                                                type="comment"
                                                onEdit={() => {
                                                  setUpdatePostModalOpen(true);
                                                  setUpdateId(reply.id);
                                                  setUpdateText(reply.content);
                                                }}
                                                onDelete={() => {
                                                  deletePost(reply.id, type);
                                                }}
                                              />
                                            )}
                                          </div>
                                        )}

                                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mr-2">
                                          <img
                                            src={reply.profile_picture ? `data:image/jpg;base64,${reply.profile_picture}` : "/assets/default.png"}
                                            className="w-6 h-6 rounded-full object-cover border-2 border-white shadow"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <div>
                                            <div className="text-xs font-semibold text-gray-700 text-left">
                                              {reply.author}{" "}
                                              <span className="text-gray-400 font-normal">
                                                {reply.timestamp}
                                              </span>
                                            </div>
                                            <div className="text-xs text-gray-600 text-left">
                                              {reply.content}
                                            </div>
                                          </div>

                                          {/* Formulaire de réponse pour répondre à une réponse spécifique */}
                                          {replyingTo?.postId === post.id &&
                                            replyingTo?.commentId ===
                                            comment.id &&
                                            replyingTo?.isReplyToReply &&
                                            replyingTo?.replyId ===
                                            reply.id && (
                                              <form
                                                onSubmit={handleReplySubmit}
                                                className="mt-2 flex"
                                              >
                                                <input
                                                  type="text"
                                                  value={replyText}
                                                  onChange={(e) =>
                                                    setReplyText(e.target.value)
                                                  }
                                                  placeholder={`Répondre à ${reply.author}...`}
                                                  className="flex-1 text-xs p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
                                                  disabled={creatingComment}
                                                />
                                                <button
                                                  type="submit"
                                                  disabled={
                                                    creatingComment ||
                                                    !replyText.trim()
                                                  }
                                                  className="bg-blue-500 text-white text-xs px-3 rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                  {creatingComment
                                                    ? "..."
                                                    : "Envoyer"}
                                                </button>
                                              </form>
                                            )}

                                          {/* Bouton de réponse pour les réponses (profondeur 2) */}
                                          <button
                                            onClick={() =>
                                              handleReplyClick(
                                                post.id,
                                                comment.id,
                                                reply.author,
                                                true,
                                                reply.id
                                              )
                                            }
                                            className="text-xs text-gray-500 hover:text-blue-500 mt-1"
                                            disabled={creatingComment}
                                          >
                                            Répondre
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                        {hasMore && (
                          <button
                            className="text-blue-500 text-xs mt-1 hover:underline"
                            onClick={() => handleLoadMoreComments(post.id)}
                          >
                            Voir plus de commentaires
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-around mt-4 border-t pt-3 text-sm text-gray-500">
                      <button
                        onClick={() => handleLikeToogle(post.id)}
                        className={`flex items-center space-x-2 transition ${post.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-500 hover:text-blue-500'
                          }`}
                      >
                        <FontAwesomeIcon icon={faThumbsUp} />
                        <span>{post.isLikedByCurrentUser ? 'Je n\'aime plus' : 'J\'aime'} ({post.likeCount})</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center space-x-2 hover:text-blue-500 transition"
                        onClick={() => handleCommentClick(post.id)}
                      >
                        <FontAwesomeIcon icon={faComment} />
                        <span>Commenter</span>
                      </button>
                      <button
                        className="flex items-center space-x-2 hover:text-blue-500 transition"
                        onClick={() => {
                          setSharePostModalOpen(true);
                          setSharePostId(post.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faShare} />
                        <span>Partager</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {sharePostModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm transition-all duration-300">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            aria-hidden="true"
            onClick={() => setSharePostModalOpen(false)}
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
                    Partager ce post
                  </h2>
                  <button
                    onClick={() => setSharePostModalOpen(false)}
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
                  Sélectionnez un ami avec qui partager ce post.
                </p>
              </div>

              {/* Champ de commentaire */}
              <div className="px-6 py-4">
                <input
                  type="text"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition placeholder-gray-400 bg-gray-50"
                  placeholder="Ajouter un commentaire…"
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  maxLength={200}
                />
              </div>

              {/* Liste des amis */}
              <div className="px-6 pb-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center p-3 rounded-xl hover:bg-indigo-50/80 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleShare(friend.id, shareText)}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow group-hover:border-indigo-200 transition-colors">
                        <img
                          src={friend.profile_picture ? `data:image/jpg;base64,${friend.profile_picture}` : "/assets/default.png"}
                          alt={friend.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {friend.username}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSharePostModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {UpdateModalOpen && (
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

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl p-8 w-full max-w-xl relative border border-gray-200 bg-white bg-opacity-100 backdrop-blur-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              onClick={handleModalClose}
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Leave a comment to{" "}
              <span className="text-blue-600">
                {posts.find((post) => post.id === commentPostId)?.author}
              </span>
            </h2>

            <blockquote className="bg-gray-100 border-l-4 border-blue-500 p-4 mb-6 text-gray-700 text-base text-left rounded-md shadow-sm">
              <div className="text-xs text-gray-500 mb-1">
                {posts.find((post) => post.id === commentPostId)?.updatedAt}
              </div>
              <div className="text-gray-800">
                {posts.find((post) => post.id === commentPostId)?.content}
              </div>
            </blockquote>

            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl border border-gray-300 text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none placeholder-gray-400"
                placeholder="Write your comment..."
                autoFocus
                disabled={creatingComment}
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!commentText.trim() || creatingComment}
                >
                  {creatingComment ? "Envoi..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
