const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const fonts = [
  {url: 'https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Regular.woff2', file: 'Inter-Regular.woff2'},
  {url: 'https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Light.woff2', file: 'Inter-Light.woff2'},
  {url: 'https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Medium.woff2', file: 'Inter-Medium.woff2'},
  {url: 'https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-SemiBold.woff2', file: 'Inter-SemiBold.woff2'},
  {url: 'https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Bold.woff2', file: 'Inter-Bold.woff2'},
];

const dir = path.join(__dirname, '../public/fonts/Inter');
fs.mkdirSync(dir, { recursive: true });

for (const font of fonts) {
  const dest = path.join(dir, font.file);
  if (!fs.existsSync(dest)) {
    try {
      execSync(`curl -L ${font.url} -o ${dest}` , { stdio: 'inherit' });
    } catch (err) {
      console.error('Error downloading', font.file, err.message);
    }
  }
}
