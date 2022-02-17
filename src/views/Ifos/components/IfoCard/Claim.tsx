import React from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'web3-eth-contract'
import BigNumber from 'bignumber.js'
import { AutoRenewIcon, Box, Button, Flex, Text } from '@pancakeswap-libs/uikit'
import { useToast } from 'state/hooks'
import useI18n from 'hooks/useI18n'
import { getBalanceNumber } from 'utils/formatBalance'
import { Ifo } from 'config/constants/types'
import { UserInfo, WalletIfoState } from '../../hooks/useGetWalletIfoData'
import BalanceInUsd from './BalanceInUsd'

interface ClaimProps {
  ifo: Ifo
  contract: Contract
  userInfo: UserInfo
  isPendingTx: WalletIfoState['isPendingTx']
  claimableTokenAmount: BigNumber
  setPendingTx: (status: boolean) => void
  setIsClaimed: () => void
}

const AmountGrid = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 24px;
`

const DISPLAY_DECIMALS = 4

const Claim: React.FC<ClaimProps> = ({
  ifo,
  contract,
  userInfo,
  isPendingTx,
  claimableTokenAmount,
  setPendingTx,
  setIsClaimed,
}) => {
  const TranslateString = useI18n()
  const { account } = useWeb3React()
  const didContribute = userInfo.usedCAPAmount.gt(0)
  const canClaim = claimableTokenAmount.gt(0)
  const contributedBalance = getBalanceNumber(userInfo.usedCAPAmount)
  const { name, tokenSymbol, tokenDecimals } = ifo
  const rewardBalance = getBalanceNumber(userInfo.purchasedTokenAmount, tokenDecimals)
  const { toastError, toastSuccess } = useToast()
  const claimedPercent = userInfo.purchasedTokenAmount.gt(0)
    ? userInfo.claimedTokenAmount.dividedBy(userInfo.purchasedTokenAmount).multipliedBy(100).toString()
    : '0'

  const handleClaim = async () => {
    try {
      setPendingTx(true)
      await contract.methods.claim().send({ from: account })
      setIsClaimed()
      toastSuccess('Success!', 'You have successfully claimed your rewards.')
    } catch (error) {
      toastError('Error', 'Error')
      console.error(error)
    } finally {
      setPendingTx(false)
    }
  }

  return (
    <>
      <AmountGrid>
        <Box>
          <Flex mb="4px">
            <Text as="span" bold fontSize="12px" mr="4px" textTransform="uppercase">
              BUSD Tokens
            </Text>
            <Text as="span" color="textSubtle" fontSize="12px" textTransform="uppercase" bold>
              Committed
            </Text>
          </Flex>
          <Text fontSize="20px" bold color={userInfo.usedCAPAmount.gt(0) ? 'text' : 'textDisabled'}>
            {contributedBalance.toFixed(userInfo.usedCAPAmount.eq(0) ? 0 : DISPLAY_DECIMALS)}
          </Text>
        </Box>
        <Box>
          <Flex mb="4px">
            <Text as="span" bold fontSize="12px" mr="4px" textTransform="uppercase">
              {tokenSymbol}
            </Text>
            <Text as="span" color="textSubtle" fontSize="12px" textTransform="uppercase" bold>
              ALLOCATED
            </Text>
          </Flex>
          <Text fontSize="20px" bold color={userInfo.purchasedTokenAmount.gt(0) ? 'text' : 'textDisabled'}>
            {rewardBalance.toFixed(userInfo.purchasedTokenAmount.eq(0) ? 0 : DISPLAY_DECIMALS)}
          </Text>
          {canClaim && <BalanceInUsd token={tokenSymbol} balance={rewardBalance} />}
        </Box>
        <Box>
          <Flex mb="4px">
            <Text as="span" bold fontSize="12px" mr="4px" textTransform="uppercase">
              {tokenSymbol}
            </Text>
            <Text as="span" color="textSubtle" fontSize="12px" textTransform="uppercase" bold>
              Unlocked
            </Text>
          </Flex>
          <Text fontSize="20px" bold color={claimableTokenAmount.gt(0) ? 'text' : 'textDisabled'}>
            {getBalanceNumber(claimableTokenAmount).toFixed(4)}
          </Text>
          {canClaim && <BalanceInUsd token={tokenSymbol} balance={rewardBalance} />}
        </Box>
        <Box>
          <Flex mb="4px">
            <Text as="span" bold fontSize="12px" mr="4px" textTransform="uppercase">
              {tokenSymbol}
            </Text>
            <Text as="span" color="textSubtle" fontSize="12px" textTransform="uppercase" bold>
              Claimed
            </Text>
          </Flex>
          <Text fontSize="20px" bold color={userInfo.claimedTokenAmount.gt(0) ? 'text' : 'textDisabled'}>
            {getBalanceNumber(userInfo.claimedTokenAmount).toFixed(4)}
          </Text>
          {canClaim && <BalanceInUsd token={tokenSymbol} balance={rewardBalance} />}
        </Box>
        <Box>
          <Flex mb="4px">
            <Text as="span" bold fontSize="12px" mr="4px" textTransform="uppercase">
              Claimed
            </Text>
            <Text as="span" color="textSubtle" fontSize="12px" textTransform="uppercase" bold>
              Percent
            </Text>
          </Flex>
          <Text fontSize="20px" bold color={userInfo.purchasedTokenAmount.gt(0) ? 'text' : 'textDisabled'}>
            {claimedPercent}%
          </Text>
        </Box>
      </AmountGrid>
      {didContribute ? (
        <Button
          onClick={handleClaim}
          disabled={isPendingTx || !canClaim}
          width="100%"
          mb="24px"
          isLoading={isPendingTx}
          endIcon={isPendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
        >
          {canClaim ? TranslateString(999, 'Claim') : TranslateString(999, 'Nothing to Claim')}
        </Button>
      ) : (
        <Button disabled width="100%" mb="24px">
          {TranslateString(999, 'Nothing to Claim')}
        </Button>
      )}
      <Text mt="4px">
        {TranslateString(
          999,
          `If you see allocated ${name} that you cannot claim, kindly check IFO vesting schedule from the project website.`,
        )}
      </Text>
    </>
  )
}

export default Claim
