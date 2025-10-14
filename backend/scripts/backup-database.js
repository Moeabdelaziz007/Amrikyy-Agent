const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupDir = path.join(__dirname, '../backups');
  const filename = `backup-${timestamp}.sql`;
  const filePath = path.join(backupDir, filename);

  // Ensure backup directory exists
  await fs.mkdir(backupDir, { recursive: true });

  // Supabase backup command
  const command = `
    PGPASSWORD=${process.env.SUPABASE_DB_PASSWORD} pg_dump \
      -h ${process.env.SUPABASE_DB_HOST} \
      -U ${process.env.SUPABASE_DB_USER} \
      -d ${process.env.SUPABASE_DB_NAME} \
      -f ${filePath}
  `;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error.message);
        reject(error);
        return;
      }
      console.log(`✅ Backup created: ${filename}`);
      resolve(filePath);
    });
  });
}

// Cleanup old backups (keep last 7 days)
async function cleanupOldBackups() {
  const backupDir = path.join(__dirname, '../backups');
  const files = await fs.readdir(backupDir);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stats = await fs.stat(filePath);

    if (now - stats.mtime.getTime() > sevenDays) {
      await fs.unlink(filePath);
      console.log(`🗑️  Deleted old backup: ${file}`);
    }
  }
}

// Run backup daily
async function startBackupService() {
  console.log('🔄 Starting database backup service...');

  // Run immediately on start
  await backupDatabase();
  await cleanupOldBackups();

  // Run daily
  setInterval(async () => {
    await backupDatabase();
    await cleanupOldBackups();
  }, 24 * 60 * 60 * 1000);
}

// Export for use in main server
module.exports = { backupDatabase, startBackupService };

// Run standalone
if (require.main === module) {
  startBackupService().catch(console.error);
}