const axios = require('axios');

async function test(url) {
    try {
        console.log(`Testing GET ${url} with origin http://localhost:5173`);
        const response = await axios.get(url, {
            headers: {
                'Origin': 'http://localhost:5173'
            }
        });
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

async function run() {
    await test('http://localhost:5001/');
    await test('http://localhost:5001/api/v1/settings/academic_year_config');
}

run();
