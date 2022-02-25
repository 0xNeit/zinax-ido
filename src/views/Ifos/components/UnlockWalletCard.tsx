import React from 'react'
import styled from 'styled-components'
import { Heading, Card, CardBody } from '@pancakeswap-libs/uikit'
import UnlockButton from 'components/UnlockButton'

const StyledCardBody = styled(CardBody)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-height: 196px;
`

const StyledHeading = styled(Heading)`
  margin: 16px 0;
`

const UnlockWalletCard = () => {

  return (
    <Card isActive>
      <StyledCardBody>
        {/* <IconWrapper>
          <Ticket />
        </IconWrapper> */}
        <div>
          <StyledHeading size="md">Unlock wallet to get your unique referral link</StyledHeading>
          <UnlockButton />
        </div>
      </StyledCardBody>
    </Card>
  )
}

export default UnlockWalletCard