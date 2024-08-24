/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";

const handleRequest = frames(async (ctx: any) => {
  const message = ctx?.message
  if (message === undefined || message.requesterUserData === undefined) {
    return {
      image: '../intro.png',
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      buttons: [
        <Button action="post">Refresh</Button>,
      ],
    };
  }
  return {
      image: `tokens/${message.requesterVerifiedAddresses[0]}?ts=${Date.now()}`,
      imageOptions: {
        aspectRatio: '1:1'
      },
      /*
      buttons: [
        <Button action="post">Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ]*/
    }
  });

export const GET = handleRequest;
export const POST = handleRequest;
