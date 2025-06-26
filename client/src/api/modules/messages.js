import { apiClient } from "../apiClient";


export const getAllMessages = async (id) => {
  console.log("Récupération de tous les messages...");
  try {
    const response = await apiClient.get("/messages/", {
      params: { id },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.messages;
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const sendMessage = async (messageData) => {
  console.log("Envoi d'un nouveau message:", messageData);
  try {
    const response = await apiClient.post("/messages/", messageData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.newMessage;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const sharePost = async (postId, receiverId, message) => {
  console.log("Partage d'un post:", { postId, receiverId, message });
  try {
    const response = await apiClient.post(
      "/messages/share",
      { postId, receiverId, message },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors du partage du post:", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};