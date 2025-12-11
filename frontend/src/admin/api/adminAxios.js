import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8484",
  withCredentials: true,
});

// 요청 인터셉터 (Access Token 자동 추가)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (401 → Refresh Token으로 재발급)
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // access token 만료 → 401
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://localhost:8484/auth/refresh", {
          refreshToken,
        });

        const newAccess = res.data.accessToken;
        localStorage.setItem("accessToken", newAccess);

        // 원래 요청에 새 토큰 적용
        original.headers.Authorization = `Bearer ${newAccess}`;

        return axiosInstance(original);
      } catch (err) {
        console.error("토큰 갱신 실패", err);
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
