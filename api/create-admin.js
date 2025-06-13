const bcrypt = require('bcrypt');
const fs = require('fs');

async function createAdmin() {
  const dataDir = '../data';
  const usersFile = `${dataDir}/users.json`;
  
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }
  
  const adminExists = users.find(u => u.email === 'mauro_lcf@example.com');
  if (adminExists) {
    console.log('✅ Admin já existe!');
    return;
  }
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  users.push({
    id: Date.now().toString(),
    name: 'Mauro Admin',
    email: 'mauro_lcf@example.com',
    username: 'mauroadmin',
    password: hashedPassword,
    createdAt: new Date().toISOString()
  });
  
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log('🎉 Admin criado: mauro_lcf@example.com / admin123');
}

createAdmin();