

import { gql, GraphQLClient } from 'graphql-request'
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import erc20ABI from '../contract/erc20.json';


const QUERY_POOL = gql`
  query pairs($tokens: [Bytes]!, $wraps: [Bytes]!) {
    as0: pairs(first: 6, orderBy: createdAtTimestamp, where: { token0_in: $tokens, token1_in: $wraps }) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
    as1: pairs(first: 6, orderBy: createdAtTimestamp, where: { token0_in: $wraps, token1_in: $tokens }) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
  }
`
const QUERY_SWAP = gql`
  query swap($pair: String!) {
    swaps(orderBy:timestamp, orderDirection:desc, where: { pair: $pair }, first: 50) {
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      timestamp
      pair {
        token0 {
          id
          name
          symbol
          decimals
          derivedETH
        }
        token1 {
          id
          name
          symbol
          decimals
          derivedETH
        }
        reserve0
        reserve1
        reserveUSD
        reserveETH
      }
    }
  }
`

const RPC_URL = 'https://rpc.ankr.com/eth'
const WRAP_SYMBOL = ['WETH', 'USDT', 'USDC', 'DAI', 'BUSD', 'BNB']
const WRAP_ADDRESS = [
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0x4fabb145d64652a948d72533023f6e7a623c7c53',
  '0xb8c77482e45f1f44de1745f52c74426c631bdd52'
]

const client = new GraphQLClient("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2")

const includesETH = (pair) => pair.token0.symbol === 'WETH' || pair.token1.symbol === 'WETH'


export const fetchPrice = async (ids) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    const checksumAddress = await ethers.utils.getAddress(ids[0])

    const token = new ethers.Contract(checksumAddress, erc20ABI, provider)
    const supply = await token.totalSupply()

    /* ---------------------- Promote link ---------------------- */
    let response = await client.request(QUERY_POOL, { tokens: ids, wraps: WRAP_ADDRESS })
    let pairs = [...response?.as0, ...response?.as1]
    pairs = pairs.filter((pair) => WRAP_SYMBOL.includes(pair.token0.symbol) || WRAP_SYMBOL.includes(pair.token1.symbol))
    const { id } = pairs.some(includesETH) ? pairs.filter(includesETH)[0] : pairs[0]
    // console.log(`Promote Link: https://cointools.io/chart/pair-explorer/${id}?prom=${ADMIN_PROMOLINK}`)
    /* ---------------------------------------------------------- */

    /* ----------------------- 24H Volume ----------------------- */
    // response = await client.request(QUERY_PAIR, { blockNow: block - 1, blockDayAgo: block - 6647, pairId: id })
    // const { volumeDayAgo, volumeNow } = response
    // console.log(`24H Volume: ${Number(volumeNow.volumeUSD) - Number(volumeDayAgo.volumeUSD)}`)
    /* ---------------------------------------------------------- */

    response = await client.request(QUERY_SWAP, { pair: id })
    // const graph = fetchChart(response.swaps)
    let { amount0In, amount0Out, amount1In, amount1Out, amountUSD, pair } = response.swaps[response.swaps.length - 1]
    let { token0, token1, reserve0, reserve1, reserveUSD, reserveETH } = pair
    // const isSorted = WRAP_SYMBOL.includes(pair.token0.symbol)
    const isSorted = pair.token0.id.toLowerCase() !== checksumAddress.toLowerCase()
    if (isSorted) {
      [amount0In, amount1In, amount0Out, amount1Out, token0, token1, reserve0, reserve1] =
        [amount1In, amount0In, amount1Out, amount0Out, token1, token0, reserve1, reserve0]
    }
    const label = `${token0.name} (${token0.symbol})`
    const price = amountUSD / (amount1Out > 0 ? amount0In : amount0Out)
    const decimals = new BigNumber(10).pow(token0.decimals)
    const totalSupply = new BigNumber(supply.toString()).div(decimals)
    const marketCap = new BigNumber(totalSupply.toString()).times(price)
    const ethPrice = new BigNumber(reserveUSD).div(reserveETH)
    const lpHoldingUSD = new BigNumber(reserve0).times(price)
    const lpHoldingETH = new BigNumber(lpHoldingUSD).div(ethPrice)



    return { label, price, totalSupply, marketCap, ethPrice, lpHoldingETH, lpHoldingUSD }
  } catch (error) {
    console.log("Internal server error:", error)
  }
}

