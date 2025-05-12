import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://20.244.56.144/evaluation-service'
})

export default apiClient