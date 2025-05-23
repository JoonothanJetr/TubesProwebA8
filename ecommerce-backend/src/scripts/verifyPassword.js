const bcrypt = require('bcryptjs');

const password = 'admin123';
const storedHash = '$2a$10$6noMu1WVPuXcVZeLgU0V8OYbBw.KiHnqmt1BBCHfDQ1gvuUwSO1fi';

const verifyPassword = async () => {
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log('Password Match Result:', isMatch);
};

verifyPassword();
