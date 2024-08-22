/* eslint-disable react/jsx-key */
import { frames, getHostName } from "../frames";
const handleRequest = frames(async (ctx: any) => {
    return {
      image: '../intro.png',
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      /*textInput: " Search by username",
      buttons: [
        <Button action="post">Mine/??</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ],*/
    };
  });
export const GET = handleRequest;
export const POST = handleRequest;
