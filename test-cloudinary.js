const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary Configuration:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Not set');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Not set');

// Test connection
cloudinary.api.ping()
  .then(result => {
    console.log('\n✅ Cloudinary connection successful!');
    console.log('Response:', result);
  })
  .catch(error => {
    console.error('\n❌ Cloudinary connection failed:');
    console.error('Error:', error.message);
    console.error('Details:', error);
  });
