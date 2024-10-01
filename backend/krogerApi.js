const axios = require('axios');
const qs = require('querystring');

const KROGER_AUTH_URL = 'https://api-ce.kroger.com/v1/connect/oauth2/token';
const KROGER_API_URL = 'https://api-ce.kroger.com/v1';

let accessToken = null;
let tokenExpiration = null;

async function getAccessToken() {
    if (accessToken && tokenExpiration && new Date() < tokenExpiration) {
        return accessToken;
    }

    try {
        const data = qs.stringify({
            grant_type: 'client_credentials',
            scope: 'product.compact'
        });

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(process.env.KROGER_CLIENT_ID + ':' + process.env.KROGER_CLIENT_SECRET).toString('base64')
            }
        };

        const response = await axios.post(KROGER_AUTH_URL, data, config);

        accessToken = response.data.access_token;
        tokenExpiration = new Date(Date.now() + response.data.expires_in * 1000);
        return accessToken;
    } catch (error) {
        console.error('Error getting Kroger access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get Kroger access token');
    }
}

async function searchProductsSingle(term, locationId, token) {
    const response = await axios.get(`${KROGER_API_URL}/products`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        params: {
            'filter.term': term,
            'filter.locationId': locationId,
        },
    });

    return response.data.data;
}

async function searchProducts(originalTerm, locationId = '01400943', retries = 3) {
    const token = await getAccessToken();

    // Split the original term into words
    const words = originalTerm.split(/\s+/);

    // If we have 8 or fewer words, search as is
    if (words.length <= 8) {
        for (let i = 0; i < retries; i++) {
            try {
                return await searchProductsSingle(originalTerm, locationId, token);
            } catch (error) {
                console.error(`Error searching Kroger products (attempt ${i + 1}):`, error.response ? error.response.data : error.message);
                if (i === retries - 1) {
                    throw new Error('Failed to search Kroger products after multiple attempts');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } else {
        // If we have more than 8 words, search with the first 8 and then with additional keywords
        const mainTerms = words.slice(0, 8).join(' ');
        const additionalTerms = words.slice(8).join(' ');

        let results = [];

        for (let i = 0; i < retries; i++) {
            try {
                results = await searchProductsSingle(mainTerms, locationId, token);
                break;
            } catch (error) {
                console.error(`Error searching Kroger products (attempt ${i + 1}):`, error.response ? error.response.data : error.message);
                if (i === retries - 1) {
                    throw new Error('Failed to search Kroger products after multiple attempts');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // If we got results and have additional terms, filter the results
        if (results.length > 0 && additionalTerms) {
            results = results.filter(product =>
                product.description.toLowerCase().includes(additionalTerms.toLowerCase())
            );
        }

        return results;
    }
}

module.exports = {
    searchProducts,
};