import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/feed-history';

export const feedHistoryService = {
    createFeedHistory: async (feedHistoryData) => {
        try {
            const token = authService.getCurrentUser();
            // Lấy employeeId từ token
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const employeeId = tokenData.employeeId;
            
            // Validate required fields
            if (!feedHistoryData.pigPenId || !feedHistoryData.feedPlanId || !feedHistoryData.feedingTime || !feedHistoryData.dailyFood) {
                throw new Error('Missing required fields for feed history');
            }

            // Ensure numeric fields are numbers and include employeeId
            const requestData = {
                ...feedHistoryData,
                pigPenId: Number(feedHistoryData.pigPenId),
                feedPlanId: Number(feedHistoryData.feedPlanId),
                dailyFood: Number(feedHistoryData.dailyFood),
                createdById: employeeId
            };

            console.log('Request URL:', API_URL);
            console.log('Request headers:', {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
            console.log('Request data:', JSON.stringify(requestData, null, 2));

            const response = await axios.post(API_URL, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response);
            return response.data;
        } catch (error) {
            console.error('Error creating feed history:', error);
            if (error.response) {
                console.error('Error response:', {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers
                });
                throw new Error(error.response.data || 'Error creating feed history');
            }
            throw error;
        }
    },

    getAllFeedHistories: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching feed histories:', error);
            throw error;
        }
    },

    getFeedHistoriesByPigPenId: async (pigPenId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/${pigPenId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching feed histories for pig pen:', error);
            throw error;
        }
    }
}; 