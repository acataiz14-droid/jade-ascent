const FtpDeploy = require('ftp-deploy');
const f = new FtpDeploy();

const uploadAll = process.argv.includes('--all');
const includeList = uploadAll
  ? ['*', '**/*']
  : ['index.html', 'dashboard.html', 'api.php', 'dashboard/*', 'assets/*.js', 'assets/*.css'];

console.log(`🚀 Starting FTP deploy (${uploadAll ? 'All files' : 'Updated App Bundles'})...`);

f.on('uploading', d => process.stdout.write('\r   uploading: ' + d.filename + ' (' + d.transferredFileCount + '/' + d.totalFilesCount + ')'));

f.deploy({
  user: 'u138548303.jadeasc.xn--100-mmlyaah4a1c9a0ezbc69a.com',
  password: 'Tine14022540*',
  host: '147.93.80.21',
  port: 21,
  localRoot: './dist',
  remoteRoot: '/public_html',
  include: includeList,
  deleteRemote: false,
  forcePasv: true
}).then(() => { 
  console.log('\nDeploy OK!'); 
}).catch(e => { 
  console.error('\nERR:', e.message); 
  process.exit(1); 
});
