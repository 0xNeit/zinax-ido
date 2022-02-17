import { useEffect } from 'react'
import { usePriceCakeBusd } from 'state/hooks'

const useGetDocumentTitlePrice = () => {
  const cakePriceUsd = usePriceCakeBusd()

  const cakePriceUsdString = cakePriceUsd.eq(0)
    ? ''
    : ` - $${cakePriceUsd.toNumber().toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })}`

  useEffect(() => {
    document.title = `Zinax IDO`
  }, [cakePriceUsdString])
}
export default useGetDocumentTitlePrice
