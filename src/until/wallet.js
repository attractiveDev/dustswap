import config from '../Config/config.json';
import { BigNumber, ethers } from 'ethers';


export const setupNetwork = async (externalProvider) => {

  const provider = externalProvider || window.ethereum;
  const cid = ethers.utils.hexValue(BigNumber.from(config.chain_id));
  if (provider) {
    try {
      await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cid, }]
      })
      return true;
    }
    catch (switchError) {

      if (switchError.code === 4902) {
        try {
          await provider?.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: cid,
                chainName: config.name,
                nativeCurrency: {
                  name: 'ETH',
                  symbol: config.symbol,
                  decimals: 18
                },
                rpcUrls: [config.write_rpc],
                blockExplorerUrls: [config.explorer],
              }
            ]
          })
          return true;
        }
        catch (error) {
          return false;
        }
      }
    }
  }
  else {
    console.error("Error");
  }
}