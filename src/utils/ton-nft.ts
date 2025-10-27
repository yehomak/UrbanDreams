import { Address, beginCell, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
    window.Buffer = Buffer;
  }

interface NFTMetadata {
  marketplace?: string; 
  image: string;
  name: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}


export async function fetchNFTMetadata(collectionAddress: string, index: number): Promise<NFTMetadata> {
    const client = new TonClient({
      endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
    });
  
    const collection = Address.parse(collectionAddress);

    // const collectionData = await client.runMethod(collection, 'get_collection_data', []);
    // const collectionStack = collectionData.stack;
    
    // const nextItemId = collectionStack.readNumber();
    // const collectionContentCell = collectionStack.readCell();
    // const ownerAddress = collectionStack.readAddress();
  
    // // 2. Parse collection content
    // const collectionContentSlice = collectionContentCell.beginParse();
    // let collectionContentUri: string;
    
    // if (collectionContentSlice.remainingBits >= 8) {
    //   const prefix = collectionContentSlice.preloadUint(8);
    //   if (prefix === 0x00) {
    //     collectionContentSlice.skip(8);
    //     collectionContentUri = collectionContentSlice.loadStringTail();
    //   } else {
    //     collectionContentUri = collectionContentSlice.loadStringTail();
    //   }
    // } else {
    //   collectionContentUri = collectionContentSlice.loadStringTail();
    // }
    // console.log(nextItemId);
    // console.log(collectionContentUri);
    // console.log(ownerAddress);
    
    // const nftAddressResponse = await client.runMethod(collection, 'get_nft_address_by_index', [
    //   { type: 'int', value: BigInt(index) }
    // ]);

    //const nftAddress = nftAddressResponse.stack.readAddress();
    // index = 3; // remove
    // const collection_url = "https://s.getgems.io/nft/c/6814d188296b528c124561a5/meta.json"; // remove
    // const nftAddress = Address.parse("EQDB4Tp9C9mr73KosuhqEE6qXlhJBNruCAFbZA_hyfK5rL0P");
    // console.log('Nft Item $i has address $a', index, nftAddress.toString() );
    // if (!nftAddress) throw new Error('Failed to get NFT address');
  
    // const nftData = await client.runMethod(nftAddress, 'get_nft_data');
    // const stack = nftData.stack;
    
    try {
    //   stack.skip(2); // Skip init? and index
    //   const collectionAddress = stack.readAddress(); // Collection address
    //    console.log(collectionAddress);
    //   const ownerAddress = stack.readAddressOpt(); // Current owner
    //   console.log(ownerAddress);
    //   const contentCell = stack.readCell(); // Content cell
      
    //   // 3. Parse content
    //   const contentSlice = contentCell.beginParse();
    //   let item_content: string;
      
    //   // Check for content prefix (0x00 for off-chain content)
    //   if (contentSlice.remainingBits >= 8) {
    //     const prefix = contentSlice.preloadUint(8);
    //     console.log(prefix);
    //     if (prefix === 0x00) {
    //       contentSlice.skip(8);
    //       item_content = contentSlice.loadStringTail();
    //     } else {
    //         item_content = contentSlice.loadStringTail();
    //     }
    //   } else {
    //     item_content = contentSlice.loadStringTail();
    //   }
    //   console.log(item_content);
  
    //   let metadataUri = collection_url;
    //   const url_obj = new URL(metadataUri);
    //   url_obj.pathname = url_obj.pathname.split('/').slice(0, -1).join('/');
    //   const url = url_obj.toString();

    //   console.log(url + "/" + item_content);

    //   const item_url = url + "/" + item_content;

    //   const response = await fetch(item_url);
    //   if (!response.ok) throw new Error('Failed to fetch metadata');
    //   console.log(response);

        const response = {
            "name": "",
            "description": "",
            "marketplace": "getgems.io",
            "attributes": [
              {
                "trait_type": "x",
                "value": "52.229612"
              },
              {
                "trait_type": "y",
                "value": "20.957859"
              }
            ],
            "image": ""
          };
      
      return await response;
      
    } catch (error) {
      console.error('Error parsing NFT data:', error);
      throw new Error('Invalid NFT data format');
    }
  }