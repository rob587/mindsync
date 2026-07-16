const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const analyzeEmotion = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emotion/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Errore HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("errore nella chiamata:", error);
    throw error;
  }
};
