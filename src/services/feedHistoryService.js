import axios from 'axios';

export const feedHistoryService = {
    getAllFeedHistories: async () => {
        const response = await axios.get('/api/feed-history');
        return response.data;
    },

    getFeedHistoryById: async (id) => {
        const response = await axios.get(`/api/feed-history/${id}`);
        return response.data;
    },

    getFeedHistoriesByPigPenId: async (pigPenId) => {
        const response = await axios.get(`/api/feed-history/pig-pen/${pigPenId}`);
        return response.data;
    },

    getFeedHistoriesByAnimalId: async (animalId) => {
        const response = await axios.get(`/api/feed-history/animal/${animalId}`);
        return response.data;
    },

    getFeedHistoriesByFeedPlanId: async (feedPlanId) => {
        const response = await axios.get(`/api/feed-history/feed-plan/${feedPlanId}`);
        return response.data;
    },

    getFeedHistoriesByDateRange: async (startDate, endDate) => {
        const response = await axios.get(`/api/feed-history/date-range`, {
            params: {
                startDate,
                endDate
            }
        });
        return response.data;
    },

    createFeedHistory: async (feedHistoryData) => {
        const response = await axios.post('/api/feed-history', feedHistoryData);
        return response.data;
    },

    updateFeedHistory: async (id, feedHistoryData) => {
        const response = await axios.put(`/api/feed-history/${id}`, feedHistoryData);
        return response.data;
    },

    deleteFeedHistory: async (id) => {
        const response = await axios.delete(`/api/feed-history/${id}`);
        return response.data;
    }
};
