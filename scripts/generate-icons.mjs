import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logoPath = join(__dirname, '../public/icons/logo.png');
const outputDir = join(__dirname, '../public/icons');

const sizes = [16, 48, 128];

async function generateIcons() {
  const logoBuffer = readFileSync(logoPath);

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon${size}.png`);
    
    await sharp(logoBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 107, g: 91, b: 149, alpha: 1 } // Purple background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`Generated ${outputPath}`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
