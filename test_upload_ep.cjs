const sampleText = `Mohamad Atamneh
Full Stack Engineer
Email: mohamad@example.com
Phone: +1234567890
Location: Tel Aviv

SUMMARY
Experienced Full Stack Engineer with 4+ years designing ATS-optimized web systems and distributed microservices.

EXPERIENCE
Senior Developer | Tech Corp | 2022 - Present
- Built scalable REST and GraphQL APIs serving 100k+ daily requests.
- Reduced database latency by 45% via indexing and Redis caching.

EDUCATION
B.Sc. Computer Science | University of Technology | 2018 - 2022

SKILLS
JavaScript, TypeScript, React, Node.js, Express, MongoDB, Docker`;

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let body = '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="resumeFile"; filename="resume.txt"\r\n';
body += 'Content-Type: text/plain\r\n\r\n';
body += sampleText + '\r\n';
body += '--' + boundary + '--\r\n';

fetch('http://127.0.0.1:3000/api/ai/upload-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
  },
  body: Buffer.from(body, 'utf8'),
})
.then(r => r.json())
.then(data => {
  console.log('UPLOAD RESUME RESPONSE SUCCESS:', data.success);
  console.log('EXTRACTED BASICS:', JSON.stringify(data.profile?.basics, null, 2));
  console.log('WORK COUNT:', data.profile?.work?.length);
  console.log('SKILLS:', JSON.stringify(data.profile?.skills, null, 2));
})
.catch(err => console.error('Fetch error:', err.message));
