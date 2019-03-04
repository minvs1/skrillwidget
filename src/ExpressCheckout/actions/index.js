// @flow

export const currencyChangedAction = ({
  payCurrencyId,
  receiveCurrencyId
}: {
  payCurrencyId?: number,
  receiveCurrencyId?: number
}): Object => ({
  type: 'EXPRESS_CHECKOUT_UPDATE_AMOUNT',
  payCurrencyId,
  receiveCurrencyId,
  updateCurrencyRates: true
})
