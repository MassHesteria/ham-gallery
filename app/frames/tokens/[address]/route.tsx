import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { getNFTs } from "../utils";
import sharp from "sharp";
const { GIFEncoder, applyPalette, quantize } = require('gifenc');
import path from 'path'

function getRandomIntExclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

//const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" shape-rendering="crispEdges" viewBox="0 0 16 16" style="background-color: hsla(343,60%,80%,100%)"><rect height="1" width="1" fill="#DA544E" x="6" y="3" id="a" />`;

function addBackgroundRect(svgString: string) {
  // Extract background-color from the style attribute
  const bgColorMatch = svgString.match(/background-color\s*:\s*([^;"]+)/)

  if (!bgColorMatch) {
    console.log("No background-color found in the style attribute.");
    return svgString;
  }

  const backgroundColor = bgColorMatch[1];

  // Determine the position to insert the <rect> element
  const rectInsertionPoint = svgString.indexOf('>') + 1;

  // Create the <rect> element string
  const rectElement = `<rect width="100%" height="100%" fill="${backgroundColor}" />`;

  // Insert the <rect> element after the opening <svg> tag
  const updatedSvgString = [
    svgString.slice(0, rectInsertionPoint),
    rectElement,
    svgString.slice(rectInsertionPoint),
  ].join('');

  return updatedSvgString;
}

const getLabel = async (title: string, owner: string) => {
  const data = new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div
        style={{
          fontSize: 36,
          color: "#000000",
          justifyContent: "center",
          paddingTop: "6px",
          display: "flex",
        }}
      >
        {title}
      </div>
      <div style={{
          fontSize: 16,
          color: "#0000FF",
          justifyContent: "center",
          paddingTop: "6px",
          display: "flex",
      }}>
        owned by {owner}
      </div>
      </div>
    ),
    {
      width: 600,
      height: 292,
    }
  );
  return await data.arrayBuffer();
};

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
  const background = await sharp(path.join(process.cwd(), 'main-alt.png'));

  // Create an encoding stream
  const gif = GIFEncoder();
  const width = 600;
  const height = 600;

  const getSVG = (base64: string, addBackground: boolean) => {
    const svg = Buffer.from(base64, "base64");

    if (!addBackground) {
      return svg;
    }

    const svgString = addBackgroundRect(svg.toString());
    return Buffer.from(svgString, 'utf-8')
  }

  for (let i = 0; i < NFTs.length; i++) {
    // Extract the Base64 data part
    const base64Data = NFTs[i].image_data;
    const [, base64] = base64Data.split(",");

    // Decode the Base64 string into an SVG string
    const svg = getSVG(base64, NFTs[i].add_background)

    const nft = await sharp(svg).resize(380, 380).png().toBuffer();
    const text = Buffer.from(
      await getLabel(
        `${NFTs[i].project} #${NFTs[i].id}`,
        params.address.slice(0, 20)
      )
    );

    const data = await background
      .composite([
        { input: nft, top: 71, left: 107 },
        { input: text, top: 460, left: 0 },
      ])
      .raw()
      .toBuffer();

    // Quantize your colors to a 256-color RGB palette palette
    const palette = quantize(data, 256);

    // Get an indexed bitmap by reducing each pixel to the nearest color palette
    const index = applyPalette(data, palette);

    // Write a single frame
    gif.writeFrame(index, width, height, { palette, delay: 1500 });
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
