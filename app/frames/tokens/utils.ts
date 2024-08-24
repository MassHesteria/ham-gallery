const PROJECTS = [
  { name: 'The Ham LP', field: 'img_url', type: 'svg' },
  //{ name: 'HAM Onchain Punks', field: 'metadata.img_data', type: 'png' },
  { name: 'HAMsters', field: 'img_url', type: 'svg' },
  { name: 'ham dinos', field: 'img_url', type: 'svg' },
];

export type NFTData = {
  project: string;
  id: string;
  image_data: string;
  add_background: boolean;
}

function objectToQueryString(params: any) {
  return Object.entries(params)
    .map(
      ([key, value]: [any, any]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

async function fetchPaginatedData(apiUrl: string) {
  const NFTs: NFTData[] = [];
  let hasNextPage = true;
  let nextPageParams = {};

  while (hasNextPage) {
    // Construct the URL with the next page parameters
    const queryString = Object.keys(nextPageParams).length
      ? `?${objectToQueryString(nextPageParams)}`
      : "";
    const url = `${apiUrl}${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store'
      });
      const data = await response.json();

      data.items.forEach((i: any) => {
        switch (i.token.name) {
          case "HAMsters":
            NFTs.push({
              project: i.token.name,
              id: i.id,
              image_data: i.image_url,
              add_background: false,
            });
            break;
          case "The Ham LP":
            NFTs.push({
              project: "Ham LP",
              id: i.id,
              image_data: i.image_url,
              add_background: false,
            });
            break;
          case "HAM Onchain Punks":
            NFTs.push({
              project: "HAM Punks",
              id: i.id,
              image_data: i.metadata.image_data,
              add_background: false,
            });
            break;
          case "ham dinos":
            //console.log(i.metadata)
            NFTs.push({
              project: i.token.name,
              id: i.id,
              image_data: i.image_url,
              add_background: true,
            });
          default:
            break;
        }
      });

      // Check if there are more pages to fetch
      if (data.next_page_params) {
        nextPageParams = data.next_page_params;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      hasNextPage = false; // Exit loop on error
    }
  }

  return NFTs;
}

export const getNFTs = async (address: string) => {
  //const route = `https://explorer.ham.fun/api/v2/addresses/${address}/nft?type=ERC-721%2CERC-404%2CERC-1155`;
  const route = `https://explorer.ham.fun/api/v2/addresses/${address}/nft?type=ERC-721`;
  const NFTs: NFTData[] = await fetchPaginatedData(route);
  //console.log(NFTs[0])
  return NFTs;
}