import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

const apiCall = async (config) => {
    const { method = "get", url, data, headers = {}, options = {} } = config;

    if (!url) {
        throw new Error("URL is required for API call");
    }

    try {
        const axiosConfig = {
            headers: { ...headers,
                "App-Key": import.meta.env.VITE_API || 'fallback-key' },
            ...options 
        };

        let response;

        switch (method.toLowerCase()) {
            case "get":
                response = await api.get(url, axiosConfig);
                break;

            case "post":
                response = await api.post(url, data, axiosConfig);
                break;

            case "put":
                response = await api.put(url, data, axiosConfig);
                break;

            case "delete":
                response = await api.delete(url, axiosConfig);
                break;

            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }

        return response;
    } catch (error) {
        console.error(`API call failed [${method.toUpperCase()} ${url}]:`, error);
        
        const apiError = {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
            data: error.response?.data,
        };
        
        throw apiError;
    }
}

export default apiCall;