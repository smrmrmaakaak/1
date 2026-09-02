// test_server_upload.js
const fs = require('fs');

async function testUpload() {
  const imgBuffer = fs.readFileSync('assets/images/sink_bellago/photo_1.jpg');
  const base64 = imgBuffer.toString('base64');
  
  const form = new URLSearchParams();
  form.append('key', '6d207e02198a847aa98d0a2a901485a5');
  form.append('action', 'upload');
  form.append('source', base64);
  form.append('format', 'json');
  
  const res = await fetch('https://freeimage.host/api/1/upload', {
    method: 'POST',
    body: form,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  const json = await res.json();
  console.log("Server-side CDN Upload Status:", res.status);
  console.log("Image URL:", json?.image?.url);
}

testUpload().catch(console.error);
