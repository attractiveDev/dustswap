import { getAddress } from '@ethersproject/address'
import memoize from 'lodash/memoize'


export const isAddress = memoize((value) => {
  try {
    return getAddress(value)
  } catch {
    return false
  }
})