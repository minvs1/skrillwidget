import { takeLatest, put, call, select } from 'redux-saga/effects'
import { formValueSelector, change } from 'redux-form'

import { updateCurrencyRates } from '../../@coingate/sagas'

const expressCheckoutFormSelector = formValueSelector('expressCheckoutForm')

function* updateAmount(action) {
  const expressCheckoutState = yield select(state => state.expressCheckoutState)
  const expressCheckout = yield select(state =>
    expressCheckoutFormSelector(state, 'express_checkout')
  )
  const focusedInput = action.amountKind || expressCheckoutState.lastInput

  const currentPayCurrency = expressCheckoutState.payCurrencies.find(
    curr => curr.id == (action.payCurrencyId || expressCheckout.pay_currency_id)
  )
  const currentReceiveCurrency = expressCheckoutState.receiveCurrencies.find(
    curr =>
      curr.id ==
      (action.receiveCurrencyId || expressCheckout.receive_currency_id)
  )

  if (!currentPayCurrency || !currentReceiveCurrency) {
    return
  }

  if (action.updateCurrencyRates) {
    yield call(updateCurrencyRates, {
      from: currentPayCurrency.isoSymbol,
      to: currentReceiveCurrency.isoSymbol
    })
  }

  const currencyRates = yield select(state => state.currencyRates)

  if (focusedInput == 'pay') {
    const currentPayReceiveCurrencyRate =
      currencyRates &&
      currencyRates.rates &&
      currencyRates.rates[currentPayCurrency.isoSymbol] &&
      currencyRates.rates[currentPayCurrency.isoSymbol][
        currentReceiveCurrency.isoSymbol
      ]

    const payAmount = action.amount || expressCheckout.pay_amount
    const receiveAmount =
      payAmount == '' ? '' : currentPayReceiveCurrencyRate * payAmount

    if (!receiveAmount && receiveAmount != '') {
      return
    }

    yield put(
      change(
        'expressCheckoutForm',
        'express_checkout[receive_amount]',
        (receiveAmount / (expressCheckoutState.fee / 100 + 1)).toFixed(6)
      )
    )
  } else if (focusedInput == 'receive') {
    const currentReceivePayCurrencyRate =
      currencyRates &&
      currencyRates.rates &&
      currencyRates.rates[currentReceiveCurrency.isoSymbol] &&
      currencyRates.rates[currentReceiveCurrency.isoSymbol][
        currentPayCurrency.isoSymbol
      ]
    const receiveAmount = action.amount || expressCheckout.receive_amount
    const payAmount =
      receiveAmount == '' ? '' : currentReceivePayCurrencyRate * receiveAmount

    if (!payAmount && payAmount != '') {
      return
    }

    yield put(
      change(
        'expressCheckoutForm',
        'express_checkout[pay_amount]',
        (payAmount * (expressCheckoutState.fee / 100 + 1)).toFixed(2)
      )
    )
  }

  if (action.amountKind) {
    yield put({
      type: 'EXPRESS_CHECKOUT_SET_LAST_INPUT',
      input: action.amountKind
    })
  }
}

export function* updateAmountSaga() {
  yield takeLatest('EXPRESS_CHECKOUT_UPDATE_AMOUNT', updateAmount)
}
