import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { Ifo } from 'config/constants/types'
import { useERC20, useIfoContract } from 'hooks/useContract'
import { useIfoAllowance } from 'hooks/useAllowance'
import makeBatchRequest from 'utils/makeBatchRequest'

export interface UserInfo {
  usedCAPAmount: BigNumber
  purchasedTokenAmount: BigNumber
  claimedTokenAmount: BigNumber
}

export interface WalletIfoState {
  isPendingTx: boolean
  isWhitelisted: boolean
  claimableTokenAmount: BigNumber
  userInfo: UserInfo
}

/**
 * Gets all data from an IFO related to a wallet
 */
 const useGetWalletIfoData = (ifo: Ifo) => {
  const [state, setState] = useState<WalletIfoState>({
    isPendingTx: false,
    isWhitelisted: false,
    claimableTokenAmount: new BigNumber(0),
    userInfo: {
      usedCAPAmount: new BigNumber(0),
      purchasedTokenAmount: new BigNumber(0),
      claimedTokenAmount: new BigNumber(0),
    },
  })

  const { address, currencyAddress } = ifo
  const { isPendingTx } = state

  const { account } = useWeb3React()
  const contract = useIfoContract(address)
  const currencyContract = useERC20(currencyAddress)
  const allowance = useIfoAllowance(currencyContract, address, isPendingTx)

  const setPendingTx = (status: boolean) =>
    setState((prevState) => ({
      ...prevState,
      isPendingTx: status,
    }))

  const addUserContributedAmount = (amount: BigNumber) => {
    setState((prevState) => ({
      ...prevState,
      userInfo: {
        ...prevState.userInfo,
        amount: prevState.userInfo.usedCAPAmount.plus(amount),
      },
    }))
  }

  const setIsClaimed = () => {
    setState((prevState) => ({
      ...prevState,
      userInfo: {
        ...prevState.userInfo,
        claimed: true,
      },
    }))
  }

  useEffect(() => {
    const fetchIfoData = async () => {
      const [userInfoResponse, whitelistResponse, claimableToken] = (await makeBatchRequest([
        contract.methods.userInfo(account).call,
        contract.methods.isWhitelisted(account).call,
        contract.methods.claimableToken(account).call,
      ])) as [UserInfo, boolean, BigNumber, BigNumber]

      setState((prevState) => ({
        ...prevState,
        userInfo: {
          usedCAPAmount: new BigNumber(userInfoResponse.usedCAPAmount),
          purchasedTokenAmount: new BigNumber(userInfoResponse.purchasedTokenAmount),
          claimedTokenAmount: new BigNumber(userInfoResponse.claimedTokenAmount),
        },
        isWhitelisted: whitelistResponse,
        claimableTokenAmount: new BigNumber(claimableToken),
      }))
    }

    if (account) {
      fetchIfoData()
    }
  }, [account, contract, setState])

  return { ...state, allowance, contract, setPendingTx, addUserContributedAmount, setIsClaimed }
}

export default useGetWalletIfoData
