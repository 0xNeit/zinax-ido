import BigNumber from 'bignumber.js'
import { BSC_BLOCK_TIME } from 'config'
import { Ifo, IfoStatus } from 'config/constants/types'
import { useBlock } from 'state/hooks'
import { useIfoContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'
import makeBatchRequest from 'utils/makeBatchRequest'

export interface PublicIfoState {
  status: IfoStatus
  blocksRemaining: number
  secondsUntilStart: number
  progress: number
  secondsUntilEnd: number
  raisingAmount: BigNumber
  totalAmount: BigNumber
  tokenPerLPT: BigNumber
  startBlockNum: number
  endBlockNum: number
  maxCapPerUser: BigNumber
  minCapPerUser: BigNumber
}

const getStatus = (currentBlock: number, startBlock: number, endBlock: number): IfoStatus => {
  // Add an extra check to currentBlock because it takes awhile to fetch so the initial value is 0
  // making the UI change to an inaccurate status
  if (currentBlock === 0) {
    return 'idle'
  }

  if (currentBlock < startBlock) {
    return 'coming_soon'
  }

  if (currentBlock >= startBlock && currentBlock <= endBlock) {
    return 'live'
  }

  if (currentBlock > endBlock) {
    return 'finished'
  }

  return 'idle'
}

/**
 * Gets all public data of an IFO
 */
const useGetPublicIfoData = (ifo: Ifo) => {
  const { address } = ifo
  const [state, setState] = useState<PublicIfoState>({
    status: 'idle',
    blocksRemaining: 0,
    secondsUntilStart: 0,
    progress: 5,
    secondsUntilEnd: 0,
    raisingAmount: new BigNumber(0),
    totalAmount: new BigNumber(0),
    tokenPerLPT: new BigNumber(0),
    startBlockNum: 0,
    endBlockNum: 0,
    maxCapPerUser: new BigNumber(0),
    minCapPerUser: new BigNumber(0),
  })
  const { blockNumber: currentBlock } = useBlock()
  const contract = useIfoContract(address)

  useEffect(() => {
    const fetchProgress = async () => {
      const [
        startBlock,
        endBlock,
        raisingAmount,
        totalAmount,
        tokenPerLpToken,
        maxCapAmountPerUser,
        minCapAmountPerUser,
      ] = (await makeBatchRequest([
        contract.methods.startBlock().call,
        contract.methods.endBlock().call,
        contract.methods.soldTokenAmount().call,
        contract.methods.tokenAmountForSale().call,
        contract.methods.tokenPerLPToken().call,
        contract.methods.maxCapPerUser().call,
        contract.methods.minCapPerUser().call,
      ])) as [string, string, string, string, BigNumber, BigNumber, BigNumber, BigNumber]

      const startBlockNum = parseInt(startBlock, 10)
      const endBlockNum = parseInt(endBlock, 10)

      const status = getStatus(currentBlock, startBlockNum, endBlockNum)
      const totalBlocks = endBlockNum - startBlockNum
      const blocksRemaining = endBlockNum - currentBlock

      // Calculate the total progress until finished or until start
      const progress =
        currentBlock > startBlockNum
          ? new BigNumber(raisingAmount).dividedBy(new BigNumber(totalAmount)).multipliedBy(100).toNumber() // ((currentBlock - startBlockNum) / totalBlocks) * 100
          : ((currentBlock - startBlockNum) / (endBlockNum - startBlockNum)) * 100

      setState({
        secondsUntilEnd: blocksRemaining * BSC_BLOCK_TIME,
        secondsUntilStart: (startBlockNum - currentBlock) * BSC_BLOCK_TIME,
        raisingAmount: new BigNumber(raisingAmount),
        totalAmount: new BigNumber(totalAmount),
        tokenPerLPT: new BigNumber(tokenPerLpToken),
        status,
        progress,
        blocksRemaining,
        startBlockNum,
        endBlockNum,
        maxCapPerUser: maxCapAmountPerUser,
        minCapPerUser: minCapAmountPerUser,
      })
    }

    fetchProgress()
  }, [address, currentBlock, contract, setState])

  return state
}

export default useGetPublicIfoData
