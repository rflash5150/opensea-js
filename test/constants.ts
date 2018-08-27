import { OpenSeaAPI } from '../src/api'
import { Network, Order } from '../src/types'
import { OpenSeaPort } from '../src'
import { promisify } from '../src/wyvern'

export const mainApi = new OpenSeaAPI({
  networkName: Network.Main
})

export const rinkebyApi = new OpenSeaAPI({
  networkName: Network.Rinkeby
})

export const apiToTest = rinkebyApi

export const CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
export const CRYPTO_CRYSTAL_ADDRESS = '0xcfbc9103362aec4ce3089f155c2da2eea1cb7602'
export const CK_RINKEBY_ADDRESS = '0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
export const CK_RINKEBY_TOKEN_ID = 111
export const CK_RINKEBY_SELLER_FEE = 125
export const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'

const proxyABI: any = {'constant': false, 'inputs': [{'name': 'dest', 'type': 'address'}, {'name': 'howToCall', 'type': 'uint8'}, {'name': 'calldata', 'type': 'bytes'}], 'name': 'proxy', 'outputs': [{'name': 'success', 'type': 'bool'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}

// TODO fix this - currently returns false for everything
export async function canSettleSellOrder(client: OpenSeaPort, order: Order): Promise<boolean> {
  const proxy = await client._getProxy(order.maker)
  if (!proxy) {
    console.warn(`No proxy found for order maker ${order.maker}`)
    return false
  }
  const contract = (client.web3.eth.contract([proxyABI])).at(proxy)
  return promisify<boolean>(c =>
    contract.proxy.call(
      order.target,
      order.howToCall,
      order.calldata,
    c)
  )
}
