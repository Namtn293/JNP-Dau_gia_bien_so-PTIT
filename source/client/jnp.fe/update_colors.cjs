const fs = require('fs');
const path = require('path');
const mappings = {
  'cho-bien-tap/ChoBienTap.tsx': 'var(--status-editorial)',
  'so-duyet/SoDuyet.tsx': 'var(--status-peer-review)',
  'duyet-noi-dung/DuyetNoiDung.tsx': 'var(--status-content-review)',
  'duyet-xuat-ban/DuyetXuatBan.tsx': 'var(--status-publish-review)'
};

Object.keys(mappings).forEach(file => {
  const fullPath = path.join('src/apps/quan-ly-bai-viet/pages/xuat-ban-bai-viet/pages', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('buttonColor=')) {
      content = content.replace(/<BulkActionToolbar/g, `<BulkActionToolbar buttonColor="${mappings[file]}"`);
      fs.writeFileSync(fullPath, content);
      console.log(file + ' updated');
    }
  }
});
