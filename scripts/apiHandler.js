const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Retrieve the API keys from the environment variables
const apiKeys = process.env.API_KEYS.split(',');

async function removeBackground(imageUrl) {
    // Rotate through the API keys
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    try {
        const response = await axios.post('https://api.backgroundremoval.com/remove', {
            image_url: imageUrl
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {removeBackground};
