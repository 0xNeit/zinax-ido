import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Modal, LinkExternal, Box, Text, Flex } from '@pancakeswap-libs/uikit'
import BalanceInput from 'components/BalanceInput'
import useTokenBalance from 'hooks/useTokenBalance'
import { getBalanceNumber } from 'utils/formatBalance'
import useI18n from 'hooks/useI18n'
import ApproveConfirmButtons from 'views/Profile/components/ApproveConfirmButtons'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useERC20 } from 'hooks/useContract'
import { UserInfo } from 'views/Ifos/hooks/useGetWalletIfoData'

interface Props {
  currency: string
  contract: any
  currencyAddress: string
  maxAmount: BigNumber
  minAmount: BigNumber
  userInfo: UserInfo
  tokenPerLPT: BigNumber
  remainingTokenAmount: BigNumber
  onSuccess: (amount: BigNumber) => void
  onDismiss?: () => void
}

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

function getReferrer() {
  const ref = localStorage.getItem('REFERRER')
  if (ref) {
    return ref
  }
  return EMPTY_ADDRESS
}

const ContributeModal: React.FC<Props> = ({
  currency,
  contract,
  currencyAddress,
  maxAmount,
  minAmount,
  userInfo,
  tokenPerLPT,
  remainingTokenAmount,
  onDismiss,
  onSuccess,
}) => {
  const [value, setValue] = useState('')
  const { account } = useWeb3React()
  const raisingTokenContract = useERC20(currencyAddress)
  const balance = getBalanceNumber(useTokenBalance(currencyAddress))
  const TranslateString = useI18n()
  const valueWithTokenDecimals = new BigNumber(value).times(new BigNumber(10).pow(18))
  const remainingCapForUser = new BigNumber(maxAmount).minus(userInfo.usedCAPAmount)
  const usableCap = getBalanceNumber(remainingTokenAmount.dividedBy(tokenPerLPT).div(new BigNumber(10).pow(18)))
  const referrer = getReferrer()

  const {
    isApproving,
    isApproved,
    isConfirmed,
    isConfirming,
    handleApprove,
    handleConfirm,
  } = useApproveConfirmTransaction({
    onRequiresApproval: async () => {
      try {
        const response = await raisingTokenContract.methods.allowance(account, contract.options.address).call()
        const currentAllowance = new BigNumber(response)
        return currentAllowance.gt(0)
      } catch (error) {
        return false
      }
    },
    onApprove: () => {
      return raisingTokenContract.methods
        .approve(contract.options.address, ethers.constants.MaxUint256)
        .send({ from: account })
    },
    onConfirm: () => {
      return contract.methods
      .deposit(valueWithTokenDecimals.toString(), referrer)
      .send({ from: account })
    },
    onSuccess: async () => {
      onDismiss()
      onSuccess(valueWithTokenDecimals)
    },
  })

  return (
    <Modal title={`Contribute ${currency}`} onDismiss={onDismiss}>
      <Box maxWidth="400px">
        <BalanceInput
          title={TranslateString(999, 'Contribute')}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          symbol={currency}
          max={balance}
          onSelectMax={() => setValue(BigNumber.minimum(balance, getBalanceNumber(remainingCapForUser)).toString())}
          mb="24px"
        />
        <Flex mt="24px" mb="4px" alignItems="center" justifyContent="space-between">
          <Text mr="8px" color="textSubtle">
            {TranslateString(999, 'Minimum Cap Per User')}:
          </Text>
          <Text mr="8px" color="textSubtle">
            {getBalanceNumber(minAmount)} BUSD
          </Text>
        </Flex>
        <Flex mb="4px" alignItems="center" justifyContent="space-between">
          <Text mr="8px" color="textSubtle">
            {TranslateString(999, 'Maximum Cap Per User')}:
          </Text>
          <Text mr="8px" color="textSubtle">
            {getBalanceNumber(maxAmount)} BUSD
          </Text>
        </Flex>
        <Flex mb="24px" alignItems="center" justifyContent="space-between">
          <Text mr="8px" color="textSubtle">
            {TranslateString(999, 'Your Remaining Cap')}:
          </Text>
          <Text mr="8px" color="textSubtle">
            {getBalanceNumber(remainingCapForUser)} BUSD
          </Text>
        </Flex>
        <Flex mb="24px" alignItems="center" justifyContent="space-between">
          <Text mr="8px" color="textSubtle">
            {TranslateString(999, 'Rest Cap')}:
          </Text>
          <Text mr="8px" color="textSubtle">
            {usableCap} BUSD
          </Text>
        </Flex>
        <ApproveConfirmButtons
          isApproveDisabled={isConfirmed || isConfirming || isApproved}
          isApproving={isApproving}
          isConfirmDisabled={
            !isApproved ||
            isConfirmed ||
            valueWithTokenDecimals.isNaN() ||
            valueWithTokenDecimals.isLessThan(minAmount) ||
            valueWithTokenDecimals.isGreaterThan(maxAmount) ||
            valueWithTokenDecimals.isGreaterThan(remainingCapForUser)
          }
          isConfirming={isConfirming}
          onApprove={handleApprove}
          onConfirm={handleConfirm}
        />
        <LinkExternal
          href="https://exchange.pancakeswap.finance/"
          style={{ margin: '16px auto 0' }}
        >
          {`Get ${currency}`}
        </LinkExternal>
      </Box>
    </Modal>
  )
}

export default ContributeModal
