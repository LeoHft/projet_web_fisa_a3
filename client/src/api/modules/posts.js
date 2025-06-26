import { apiClient } from "../apiClient";
import { getUsersByIds } from "./users";


export const getUserPosts = async (userId = null) => {
  console.log("Récupération des posts de l'utilisateur...");
  try {
    const endpoint = userId ? `/posts/getUserPosts/${userId}` : `/posts/getUserPosts`;
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
}

export const getUserComments = async (userId = null) => {
  console.log("Récupération des commentaires de l'utilisateur...");
  try {
    const endpoint = userId ? `/posts/getUserComments/${userId}` : `/posts/getUserComments`;
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
}


export const createPost = async (postData) => {
  console.log("Création d'un nouveau post...");
  try {
    const response = await apiClient.post("/posts/createPost", postData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
}



export const getFollowingUsersPosts = async () => {
  try {
    const followingResponse = await apiClient.get("/users/following", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const postsResponse = await apiClient.post("/posts/getFollowingPosts", {
      followingUsersId: followingResponse.data.followings.map(following => ({
        id: following.id,
        username: following.username
      }))
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });


    const posts = postsResponse.data.followingUsersPosts;

    if (!posts || posts.length === 0) {
      console.log('Aucun post trouvé');
      return [];
    }

    // Extraire les IDs uniques des utilisateurs depuis les posts
    const userIds = [...new Set(posts.map(post => post.userId))];

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // On fusionne les images avec les données des posts
    const postsWithProfilePictures = posts.map(post => ({
      ...post,
      profile_picture: imagesMap[post.userId] || null,
    }));


    return postsWithProfilePictures;

  } catch (error) {
    console.error('Error fetching following users posts:', error);
    throw error;
  }
};



// Fonction pour récupérer les commentaires d'un post spécifique
export const getPostComments = async (postId, parentId = null) => {
  console.log(`Récupération des commentaires pour le post ${postId} avec parentId ${parentId}...`);
  try {
    const response = await apiClient.get(`/posts/${postId}/${parentId}/getComments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.data.comments) {
      console.log('Aucun commentaire trouvé pour ce post.');
      return [];
    }

    // Récupérer les IDs uniques des utilisateurs
    const uniqueUserIds = [...new Set(response.data.comments.map(comment => comment.userId))];

    // Récupérer les informations des utilisateurs
    const usersData = await getUsersByIds(uniqueUserIds);

    // Créer un map pour un accès aux usernames
    const usernameMap = {};
    usersData.forEach(user => {
      usernameMap[user.id] = user.username;
    });

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds: uniqueUserIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // Enrichir les commentaires avec les usernames et photos de profil
    const commentsWithUsernamesAndPictures = response.data.comments.map(comment => ({
      ...comment,
      username: usernameMap[comment.userId] || 'Inconnu',
      profile_picture: imagesMap[comment.userId] || null,
      // Formatage uniquement côté frontend
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return commentsWithUsernamesAndPictures;
  } catch (error) {
    console.error('Error fetching post comments:', error);
    throw error;
  }
};


// Fonction pour créer un commentaire
export const createComment = async (postId, parentId = null, content) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/${parentId}/CreateComment`, {
      content
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Fonction pour liker/unliker un post
export const toggleLikePost = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/toggleLike`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/getPostById/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.data.post) {
      console.log('Post not found');
      return null;
    }
    return response.data.post;
  }
  catch (error) {
    console.error('Error fetching post by ID:', error);
    throw new Error(error.response.data.message);
  }
};

export const updatePost = async (postId, content, type) => {
  console.log(`Mise à jour du post ${postId}...`);
  try {
    const response = await apiClient.post(`/posts/updatePost`, { postId, content, type }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error);
    throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du post");
  }
};

export const deletePost = async (postId, type) => {
  console.log(`Suppression du post ${postId}...`);
  console.log(`Type de suppression: ${type}`);
  try {
    const response = await apiClient.post(`/posts/deletePost`, { postId, type }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    throw new Error(error.response?.data?.message || "Erreur lors de la suppression du post");
  }
};
