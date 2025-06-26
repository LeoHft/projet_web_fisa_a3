import { apiClient } from "../apiClient";



export const register = async (userData) => {
    console.log("Tentative de création d'un nouvel utilisateur...");
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};


export const login = async (email, password) => {
    console.log("Tentative de connexion...");
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

export const validateUser = async (userId) => {
  console.log("Validation de l'utilisateur avec ID:", userId);
  try {
    const response = await apiClient.post(`/users/validate`, { userId }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la validation de l'utilisateur:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const createUser = async (userData) => {
  console.log("Création d'un nouvel utilisateur avec les données:", userData);
  try {
    const response = await apiClient.post(`/users/create`, userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};


export const getUser = async (userId = null) => {
  console.log("Récupération des informations de l'utilisateur...");

  try {
    const endpoint = userId ? `/users/getUser/${userId}` : `/users/getUser`;
    const endpoint_image = userId ? `/images/getUserPicture/${userId}` : `/images/getUserPicture`;

    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    const response_image = await apiClient.get(endpoint_image, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    const combinedData = {
      data: {
        ...response.data,
        image: response_image.data
      }
    };

    return combinedData.data;

  } catch (error) {
    const message = error.response?.data?.message || "Erreur lors de la récupération de l'utilisateur";
    console.error("Erreur getUser:", message);
    throw new Error(message);
  }
};


export const searchValidateUsers = async (query) => {
  console.log("Recherche d'utilisateurs à valider avec la requête:", query);
  try {
    const response = await apiClient.get(`/users/searchvalidate?query=${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });


    const users = response.data;
    const userIds = users.map(user => user.id);

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // On fusionne les images avec les données utilisateurs
    const SearchUsersWithImages = users.map(user => ({
      ...user,
      profile_picture: imagesMap[user.id] || null,
    }));


    return SearchUsersWithImages;
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs à valider:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const searchBanUsers = async (query) => {
  console.log("Recherche d'utilisateurs à valider avec la requête:", query);
  try {
    const response = await apiClient.get(`/users/searchban?query=${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const users = response.data;
    const userIds = users.map(user => user.id);

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // On fusionne les images avec les données utilisateurs
    const SearchUsersWithImages = users.map(user => ({
      ...user,
      profile_picture: imagesMap[user.id] || null,
    }));

    return SearchUsersWithImages;
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs à banir:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const banUser = async (userId) => {
  console.log("Bannissement de l'utilisateur avec ID:", userId);
  try {
    const response = await apiClient.post(`/users/ban`, {userId}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error("Erreur lors du bannissement de l'utilisateur:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};


export const getUsersByIds = async (userIds) => {
  console.log("Récupération des utilisateurs...", userIds);

  try {
    const response = await apiClient.post('/users/getUsersByIds', {
      userIds: userIds
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;

  } catch (error) {
    console.error("Erreur getUsersByIds:", error);
    throw error;
  }
};

export const userFollowers = async (userId = null) => {
  console.log("Récupération des abonnés de l'utilisateur...");
  try {
    const endpoint = userId ? `/users/followers/${userId}` : `/users/followers`;
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


export const userFollowings = async (userId = null) => {
  console.log("Récupération des abonnements de l'utilisateur...");
  try {
    const endpoint = userId ? `/users/following/${userId}` : `/users/following`;
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const followings = response.data;
    const userIds = followings.followings.map(user => user.id);

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // On fusionne les images avec les données utilisateurs
    const followingsWithImages = followings.followings.map(user => ({
      ...user,
      profile_picture: imagesMap[user.id] || null,
    }));

    followingsWithImages.followingsCount = followings.followingsCount;


    return followingsWithImages;
  } catch (error) {
    console.error("Erreur lors de la récupération des abonnements :", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
}


export const followUser = async (userId) => {
  console.log("Tentative de suivi de l'utilisateur avec ID:", userId);
  try {
    const response = await apiClient.post(`/users/follow/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du suivi :", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
}


export const unfollowUser = async (userId) => {
  console.log("Tentative de désabonnement de l'utilisateur avec ID:", userId);
  try {
    const response = await apiClient.delete(`/users/unfollow/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du désabonnement :", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
}



export const editProfileImage = async (imageBase64, userId = null) => {
  try {
    const endpoint = userId 
      ? `/images/postUserPicture/${userId}` 
      : `/images/postUserPicture`;

    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      endpoint,
      { image: imageBase64 }, // corps de la requête
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Erreur lors du changement de photo de profil :", error);
  }
};

export const searchUsers = async (query) => {
  console.log("Recherche d'utilisateurs avec la requête:", query);
  try {
    const response = await apiClient.get(`/users/search?query=${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const users = response.data;
    const userIds = users.map(user => user.id);

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // On fusionne les images avec les données utilisateurs
    const SearchUsersWithImages = users.map(user => ({
      ...user,
      profile_picture: imagesMap[user.id] || null,
    }));

    return SearchUsersWithImages;
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const getFriends = async () => {
  console.log("Récupération des amis de l'utilisateur...");
  try {
    const response = await apiClient.get('/users/getFriends', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const users = response.data;
    const userIds = users.map(user => user.id);

    // Appel backend pour récupérer les images associées
    const responseImages = await apiClient.post(`/images/getUsersPictures`, {
      userIds,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const imagesMap = responseImages.data.images;

    // On fusionne les images avec les données utilisateurs
    const SearchUsersWithImages = users.map(user => ({
      ...user,
      profile_picture: imagesMap[user.id] || null,
    }));

    return SearchUsersWithImages;
  } catch (error) {
    console.error("Erreur lors de la récupération des amis:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};




export const editBio = async (bio,type) => {
  try {
    const response = await apiClient.post('/users/editBio', {bio, type},{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la bio", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};
