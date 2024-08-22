import { getHostName } from "./frames";
import { GET } from "./frames/route";
import { NextRequest } from "next/server";

export async function generateMetadata() {
  if (process.env['VERCEL_URL']) {
    console.log('')
    console.log('VERCEL_URL', process.env['VERCEL_URL'])
    console.log('VERCEL_BRANCH_URL', process.env['VERCEL_BRANCH_URL'])
    console.log('VERCEL_PROJECT_PRODUCTION_URL', process.env['VERCEL_PROJECT_PRODUCTION_URL'])
    console.log('NEXT_PUBLIC_VERCEL_URL', process.env['NEXT_PUBLIC_VERCEL_URL'])
    console.log('NEXT_PUBLIC_VERCEL_BRANCH_URL', process.env['NEXT_PUBLIC_VERCEL_BRANCH_URL'])
    console.log('NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL', process.env['NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL'])
    console.log('')
  }
  const framesRequest = new NextRequest(`${getHostName()}/frames`, {
    headers: { Accept: "application/frames.js+metatags" },
  });
  const metadataResponse = await GET(framesRequest);
  const metadata = await metadataResponse.json();
  return {
    title: "Ham NFT Gallery",
    description: "View your Ham NFTs in a frame",
    openGraph: {
      title: "Ham NFT Gallery",
    },
    other: {
      ...metadata
    }
  };
}

export default async function Page() {
  return (
    <div className="pl-4 pt-4">
      <center>
      <h1 className="pb-2 text-4xl">Ham NFT Gallery <span className="text-2xl">by MassHesteria</span></h1>
      <div>
        <a className="text-red-600 text-2xl no-underline hover:underline pr-8" href="https://github.com/masshesteria/ham-gallery">Source code</a>
        <a className="text-purple-600 text-2xl no-underline hover:underline" href="https://warpcast.com/masshesteria/0xec2772dc">Original cast</a>
      </div>
      </center>
    </div>
  )
}
