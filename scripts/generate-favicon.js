// This is a script you can run locally to convert the SVG to ICO
// You'll need to install the 'sharp' package: npm install sharp
// Then run: node scripts/generate-favicon.js

const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

async function generateFavicon() {
  try {
    const svgBuffer = fs.readFileSync(path.join(__dirname, "../public/favicon.png"))

    // Create multiple sizes for the favicon
    const sizes = [16, 32, 48, 64]
    const pngBuffers = await Promise.all(sizes.map((size) => sharp(svgBuffer).resize(size, size).png().toBuffer()))

    // For now, just save the 32x32 version as favicon.ico in the public directory
    // A proper .ico file would contain multiple sizes, but this is a simple solution
    await sharp(pngBuffers[1]).toFile(path.join(__dirname, "../public/favicon.ico"))

    console.log("Favicon generated successfully!")
  } catch (error) {
    console.error("Error generating favicon:", error)
  }
}

generateFavicon()
