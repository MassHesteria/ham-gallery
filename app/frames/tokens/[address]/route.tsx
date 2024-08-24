import { NextRequest, NextResponse } from "next/server";
import { getNFTs } from "../utils";
import sharp from "sharp";
const { GIFEncoder, applyPalette, quantize } = require('gifenc');

function getRandomIntExclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export async function GET(
   _: NextRequest,
   { params }: { params: { address: string}}
) {

  const NFTs = await getNFTs(params.address)
  //console.log('ran:', Date.now())

    // Fisher-Yates shuffle algorithm
  const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getRandomIntExclusive(0, i + 1); //TODO: double check range
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  shuffle(NFTs)

  //const background = await sharp('main.png').resize(600, 600);
  const background = await sharp('main-alt.png');

  // Create an encoding stream
  const gif = GIFEncoder();
  const width = 600;
  const height = 600;

  for (let i = 0; i < NFTs.length; i++) {
    // Extract the Base64 data part
    const base64Data = NFTs[i].image_data;
    const [, base64] = base64Data.split(",");

    // Decode the Base64 string into an SVG string
    const svg = Buffer.from(base64, "base64");
    const nft = await sharp(svg).resize(380, 380).png().toBuffer();

const textSvg = `
<svg width="600" height="600">
    <style>
        text { font-family: cursive; font-size: 36px; fill: black; }
    </style>
    <text x="50%" y="48.5%" dominant-baseline="middle" text-anchor="middle">
        ${NFTs[i].project} ${NFTs[i].id}
    </text>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" style="font-size: 16px; fill: blue">
        owned by ${params.address.slice(0, 20)}
    </text>
</svg>
`;

    const data = await background
      .composite([
        { input: nft, top: 71, left: 107 },
        { input: Buffer.from(textSvg), top: 214, left: 0 },
      ])
      .raw()
      .toBuffer();

    // Quantize your colors to a 256-color RGB palette palette
    const palette = quantize(data, 256);

    // Get an indexed bitmap by reducing each pixel to the nearest color palette
    const index = applyPalette(data, palette);

    // Write a single frame
    gif.writeFrame(index, width, height, { palette, delay: 1000 });
  }

  // Write end-of-stream character
  gif.finish();

  // Get the Uint8Array output of your binary GIF file
  const output = gif.bytes();

  //const pngBuffer = new Uint8Array(100).fill(0)
  const response = new NextResponse(output)
  response.headers.set("Content-Type", "image/gif");
  response.headers.set("Content-Length", `${output.length}`);

  // Set max cache time based on inputs
  //const maxCache = searchParams.get('ts') === null ? 7200 : 86400
  //response.headers.set("Cache-Control",
    //`public, s-maxage=${maxCache}, max-age=${maxCache}, stale-while-revalidate=30`);
  return response;

}
