const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'drwpabrdg',
  api_key: '749994822632324',
  api_secret: 'YWXUmyuk_-nib4fy3t6MHxf69Ts',
});

console.log('Testing Cloudinary Configuration:');
console.log('Cloud Name:', 'drwpabrdg');
console.log('API Key:', '✓ Set');
console.log('API Secret:', '✓ Set');

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
