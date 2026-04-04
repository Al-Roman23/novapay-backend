import axios from "axios";

const ACCOUNT_SERVICE_URL = "http://localhost:3001";

export const getAccountHealth = async () => {
    const response = await axios.get(`${ACCOUNT_SERVICE_URL}/`);
    return response.data;
};
