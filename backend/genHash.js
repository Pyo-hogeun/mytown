// genHash.js
const bcrypt = require('bcryptjs');
const pw = process.argv[2] || '1234';
bcrypt.hash(pw, 10).catch(console.error);
