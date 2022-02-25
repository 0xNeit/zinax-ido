import React from 'react'
import { Route, useRouteMatch } from 'react-router-dom'
import Container from 'components/layout/Container'
import IfoTabButtons from './components/IfoTabButtons'
import Hero from './components/Hero'
import CurrentIfo from './CurrentIfo'
import PastIfo from './PastIfo'
import Referrals from './Referrals'

const Ifos = () => {
  const { path } = useRouteMatch()

  return (
    <>
      <Hero />
      <Container>
        <Route exact path={`${path}`}>
          <CurrentIfo />
        </Route>
        <Referrals/>
      </Container>
    </>
  )
}

export default Ifos
