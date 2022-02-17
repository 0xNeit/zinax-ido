import React from 'react'
import BigNumber from 'bignumber.js'
import { Contract } from 'web3-eth-contract'
import { Box, Button, Flex, Text, useModal } from '@pancakeswap-libs/uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { Ifo } from 'config/constants/types'
import useI18n from 'hooks/useI18n'
import { useToast } from 'state/hooks'
import { UserInfo } from '../../hooks/useGetWalletIfoData'
import { PublicIfoState } from '../../hooks/useGetPublicIfoData'
import ContributeModal from './ContributeModal'
import PercentageOfTotal from './PercentageOfTotal'


interface ContributeProps {
  ifo: Ifo
  contract: Contract
  userInfo: UserInfo
  isPendingTx: boolean
  publicIfoData: PublicIfoState
  addUserContributedAmount: (amount: BigNumber) => void
}
const Contribute: React.FC<ContributeProps> = ({
  ifo,
  contract,
  userInfo,
  isPendingTx,
  publicIfoData,
  addUserContributedAmount,
}) => {
  const { currency, currencyAddress, name } = ifo
  const { totalAmount } = publicIfoData
  const TranslateString = useI18n()
  const contributedBalance = getBalanceNumber(userInfo.usedCAPAmount)
  const { toastSuccess } = useToast()
  const remainingTokenAmount = publicIfoData.totalAmount.minus(publicIfoData.raisingAmount)
  const usableCap = getBalanceNumber(remainingTokenAmount.dividedBy(publicIfoData.tokenPerLPT))

  const handleContributeSuccess = (amount: BigNumber) => {
    toastSuccess('Success!', `You have contributed ${getBalanceNumber(amount)} BUSD tokens to this IDO!`)
    addUserContributedAmount(amount)
  }

  const [onPresentContributeModal] = useModal(
    <ContributeModal
      currency={currency}
      contract={contract}
      currencyAddress={currencyAddress}
      maxAmount={publicIfoData.maxCapPerUser}
      minAmount={publicIfoData.minCapPerUser}
      tokenPerLPT={publicIfoData.tokenPerLPT}
      remainingTokenAmount={remainingTokenAmount}
      userInfo={userInfo}
      onSuccess={handleContributeSuccess}
    />,
    false,
  )

  return (
    <Box>
      <Flex mb="4px">
        <Text as="span" bold fontSize="12px" mr="4px" textTransform="uppercase">
          BUSD
        </Text>
        <Text as="span" color="textSubtle" fontSize="12px" textTransform="uppercase" bold>
          Committed
        </Text>
      </Flex>
      <Flex alignItems="center" mb="8px">
        <Box style={{ flex: 1 }} pr="8px">
          <Text bold fontSize="20px">
            {contributedBalance.toFixed(4)}
          </Text>
          <Text fontSize="14px" color="textSubtle">
            {getBalanceNumber(userInfo.purchasedTokenAmount).toFixed(2)} {name}
          </Text>
        </Box>
        <Button variant="danger" onClick={onPresentContributeModal} disabled={isPendingTx || !new BigNumber(usableCap).gt(0)}>
          {TranslateString(999, 'Contribute')}
        </Button>
      </Flex>
      <PercentageOfTotal userAmount={userInfo.purchasedTokenAmount} totalAmount={totalAmount} />
    </Box>
  )
}

export default Contribute
