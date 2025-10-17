const https = require('https');
const http = require('http');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/trips/route',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testRouteAPI() {
  try {
    console.log('Testing route API...');
    
    const result = await makeRequest({
      origin: 'Qasim International Container Terminal',
      destination: 'Torkham Dry Port'
    });

    console.log('Response Status:', result.status);
    console.log('Response Data:', JSON.stringify(result.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testRouteAPI();