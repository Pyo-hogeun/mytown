// genHash.js
const bcrypt = require('bcryptjs');
const pw = process.argv[2] || '1234';
bcrypt.hash(pw, 10).then(hash => console.log(hash)).catch(console.error);
