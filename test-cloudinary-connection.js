const { v2: cloudinary } = require('cloudinary');

// Configure with your credentials
cloudinary.config({
  cloud_name: 'drwpabrdg',
  api_key: '749994822632324',
  api_secret: 'YWXUmyuk_-nib4fy3t6MHxf69Ts'
});

console.log('🔧 Testing Cloudinary Connection...');
console.log('Cloud Name:', 'drwpabrdg');
console.log('API Key:', '749994...');
console.log('API Secret:', 'SET');
console.log('');

// Test the connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ SUCCESS! Cloudinary connection is working!');
    console.log('Response:', result);
    console.log('');
    console.log('Your Cloudinary account is active and ready to use.');
    console.log('Upload endpoint should now work correctly.');
  })
  .catch(error => {
    console.error('❌ FAILED! Cloudinary connection error:');
    console.error('Error:', error.message);
    console.error('Details:', error);
  });
