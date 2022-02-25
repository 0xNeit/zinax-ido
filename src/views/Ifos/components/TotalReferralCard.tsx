import React from 'react'
import styled from 'styled-components'
import { Heading, Card, CardBody, Text } from '@pancakeswap-libs/uikit'
import { useGetReferralInfo } from 'state/hooks'

const StyledLotteryCard = styled(Card)``

const TotalReferralCard = () => {
  const referralsInfo = useGetReferralInfo()
  return (
    <StyledLotteryCard>
      <CardBody>
        <Heading size="xl" mb="24px">
          Total Referrals
        </Heading>
        <Text bold>{referralsInfo.referralsCount}</Text>
      </CardBody>
    </StyledLotteryCard>
  )
}

export default TotalReferralCard