import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor acts as middleware that checks or modifies in Request or Reponse
apiClient.interceptors.request.use(
  // Interceptor works before sends Request
  (config) => {
    // get token from localstorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // Axios always initializes headers, so no need to manually assign an empty object
        config.headers.Authorization = `Bearer ${token}`;

        // For debugging
        console.log("Token being sent:", token);
        console.log("Authorization header:", config.headers.Authorization);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  // Interceptor works after comes Response
  (response) => response,
  (error) => {
    console.error("Api Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No Response recieved:", error.request);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
