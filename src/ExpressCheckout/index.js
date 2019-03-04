// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import {
  Field,
  reduxForm,
  formValueSelector,
  SubmissionError,
  change
} from 'redux-form'
import { Form, Spin, Button, Alert } from 'antd'
import { InputField, CheckboxField } from 'antd-redux-form'
import { debounce } from 'debounce'

import CurrencyAddon from '../@coingate/views/account/trader/components/CurrecyAddon'

import {
  emailValidator,
  walletAddressValidator
} from '../@coingate/helpers/validators' 

import { updateAmountSaga } from './sagas'
import { currencyChangedAction } from './actions'

import './styles.sass';

const ButtonGroup = Button.Group

const DEFAULT_PAY_CURRENCY = 'EUR'
const DEFAULT_RECEIVE_CURRENCY = 'BTC'
const RELOAD_RATES_EVERY_MS = 15000

type Props = {
  handleSubmit: any,
  expressCheckoutForm: Object,
  currentPayCurrency: Object,
  currentReceiveCurrency: Object,
  currentPayReceiveCurrencyRate: number,
  currentReceivePayCurrencyRate: number,
  expressCheckoutState: {
    payCurrencies: Array<Object>,
    receiveCurrencies: Array<Object>,
    fee: number,
    loading: boolean,
    redirecting: boolean,
    minPayAmount: number,
    maxPayAmount: number
  },
  currencyRatesLoading: boolean,
  invalid: boolean,
  submitting: boolean,
  gateway: string
}

type State = {}

class ExpressCheckout extends Component<Props, State> {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    App.Store.runSaga(updateAmountSaga)

    App.Request(`/buy/${this.props.gateway}.json`, 'GET').then(response => {
      const payCurrencies = []
      const receiveCurrencies = []

      response.currencies.forEach(currency => {
        currency.value = currency.id
        currency.isoSymbol = currency.iso_symbol
        delete currency.iso_symbol

        if (currency.kind == 'fiat') {
          payCurrencies.push(currency)

          if (currency.isoSymbol == DEFAULT_PAY_CURRENCY) {
            App.Store.dispatch(
              change(
                'expressCheckoutForm',
                'express_checkout[pay_currency_id]',
                currency.id
              )
            )
          }
        } else if (currency.kind == 'crypto') {
          receiveCurrencies.push(currency)

          if (currency.isoSymbol == DEFAULT_RECEIVE_CURRENCY) {
            App.Store.dispatch(
              change(
                'expressCheckoutForm',
                'express_checkout[receive_currency_id]',
                currency.id
              )
            )
          }
        }
      })

      App.Store.dispatch({
        ...response,
        type: 'EXPRESS_CHECKOUT_SET_DATA',
        payCurrencies,
        receiveCurrencies,
        loading: false
      })

      setTimeout(() => {
        this.fetchRates()
      }, 200)

      setInterval(() => {
        this.fetchRates()
      }, RELOAD_RATES_EVERY_MS)
    })
  }

  fetchRates = (currentPayCurrency, currentReceiveCurrency) => {
    currentPayCurrency = currentPayCurrency ||
      this.props.currentPayCurrency || { isoSymbol: DEFAULT_PAY_CURRENCY }
    currentReceiveCurrency = currentReceiveCurrency ||
      this.props.currentReceiveCurrency || {
        isoSymbol: DEFAULT_RECEIVE_CURRENCY
      }

    if (currentPayCurrency && currentReceiveCurrency) {
      App.Store.dispatch({
        type: 'UPDATE_CURRENCY_RATES',
        from: currentPayCurrency.isoSymbol,
        to: currentReceiveCurrency.isoSymbol
      })

      App.Store.dispatch({
        type: 'EXPRESS_CHECKOUT_UPDATE_AMOUNT'
      })
    }
  }

  handlePayAmountChange = debounce(event => {
    App.Store.dispatch({
      type: 'EXPRESS_CHECKOUT_UPDATE_AMOUNT',
      amountKind: 'pay',
      amount: event.target.value
    })
  }, 200)

  handleReceiveAmountChange = debounce(event => {
    App.Store.dispatch({
      type: 'EXPRESS_CHECKOUT_UPDATE_AMOUNT',
      amountKind: 'receive',
      amount: event.target.value
    })
  }, 200)

  handleQuickPayAmount = amount => {
    App.Store.dispatch(
      change('expressCheckoutForm', 'express_checkout[pay_amount]', amount)
    )

    App.Store.dispatch({
      type: 'EXPRESS_CHECKOUT_UPDATE_AMOUNT',
      amountKind: 'pay',
      amount: amount
    })
  }

  submit(values) {
    return App.Request(`/buy/${this.props.gateway}`, 'POST', {
      body: values
    })
      .then(response => {
        if (response.invoice_url) {
          App.gaSend('event', 'Trader', `Proceed to Checkout - ${this.props.gateway}`, '')

          App.Store.dispatch({
            type: 'EXPRESS_CHECKOUT_SET_REDIRECTING',
            redirecting: true
          })

          setTimeout(() => {
            window.location = response.invoice_url
          }, 1000)
        }
      })
      .catch(response => {
        throw new SubmissionError(response.errors)
      })
  }

  render() {
    const {
      handleSubmit,
      currentPayCurrency,
      currentReceiveCurrency,
      expressCheckoutForm,
      expressCheckoutState,
      invalid,
      submitting
    } = this.props

    const ratesLoading = this.props.currencyRatesLoading

    const form = (
      <div>
        <div className="body">
          {(() => {
            if (App.State.Params.Id == 'success') {
              return (
                <Alert
                  description="Your payment was successful and you will receive funds within 24 hours."
                  message="Payment was successful!"
                  showIcon
                  type="success"
                />
              )
            } else if (App.State.Params.Id == 'cancel') {
              return (
                <Alert
                  description="Your payment was canceled but another one could be made right away!"
                  message="Payment was canceled!"
                  showIcon
                  type="error"
                />
              )
            }
          })()}

          {(() => {
            if (expressCheckoutState.loading) {
              return (
                <div
                  className="text-center"
                  style={{ margin: '30px 0 20px 0' }}
                >
                  <Spin tip="Please wait while we load fields..." />
                </div>
              )
            } else {
              return (
                <Form
                  autoComplete="off"
                  onSubmit={handleSubmit(this.submit.bind(this))}
                >
                  <Field
                    addonBefore={
                      <Field
                        component={CurrencyAddon}
                        name="express_checkout[pay_currency_id]"
                        onSelect={payCurrencyId =>
                          App.Store.dispatch(
                            currencyChangedAction({ payCurrencyId })
                          )
                        }
                        options={this.props.expressCheckoutState.payCurrencies}
                      />
                    }
                    component={InputField}
                    disabled={ratesLoading}
                    name="express_checkout[pay_amount]"
                    onChange={this.handlePayAmountChange}
                    placeholder={`Amount of ${
                      currentPayCurrency.isoSymbol
                    } to will pay`}
                    type="text"
                  />

                  <div className="quick-amount">
                    <ButtonGroup>
                      <Button
                        disabled={ratesLoading}
                        onClick={() =>
                          this.handleQuickPayAmount(
                            expressCheckoutState.minPayAmount
                          )
                        }
                        size="small"
                        type="dashed"
                      >
                        {`${expressCheckoutState.minPayAmount} ${
                          currentPayCurrency.isoSymbol
                        }`}
                      </Button>
                      <Button
                        disabled={ratesLoading}
                        onClick={() => this.handleQuickPayAmount(500)}
                        size="small"
                        type="dashed"
                      >
                        {`500 ${currentPayCurrency.isoSymbol}`}
                      </Button>
                      <Button
                        disabled={ratesLoading}
                        onClick={() =>
                          this.handleQuickPayAmount(
                            expressCheckoutState.maxPayAmount
                          )
                        }
                        size="small"
                        type="dashed"
                      >
                        {`${expressCheckoutState.maxPayAmount} ${
                          currentPayCurrency.isoSymbol
                        }`}
                      </Button>
                    </ButtonGroup>
                  </div>

                  <Field
                    addonBefore={
                      <Field
                        component={CurrencyAddon}
                        name="express_checkout[receive_currency_id]"
                        onSelect={receiveCurrencyId =>
                          App.Store.dispatch(
                            currencyChangedAction({ receiveCurrencyId })
                          )
                        }
                        options={expressCheckoutState.receiveCurrencies}
                      />
                    }
                    component={InputField}
                    disabled={ratesLoading}
                    name="express_checkout[receive_amount]"
                    onChange={this.handleReceiveAmountChange}
                    placeholder={`Amount of ${
                      currentReceiveCurrency.isoSymbol
                    } you will receive`}
                    type="text"
                  />

                  <Field
                    component={InputField}
                    name="express_checkout[withdrawal_address]"
                    placeholder={`Your ${
                      currentReceiveCurrency.isoSymbol
                    } address for withdrawal`}
                    type="text"
                  />

                  <p style={{ marginTop: '-10px' }}>
                    <small>
                      {currentReceiveCurrency.isoSymbol}
                      {' address must be '}
                      <b>{'yours'}</b>
                      {' and '}
                      <b>{'under your full control'}</b>
                      {'. '}
                      <a
                        href="https://blog.coingate.com/2018/07/cryptocurrency-wallets-btc-ltc-eth-bch/"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {'Don\'t have one?'}
                      </a>
                    </small>
                  </p>

                  {currentReceiveCurrency.isoSymbol === 'XRP' && (
                    <Field
                      component={InputField}
                      name="express_checkout[additional_fields][destination_tag]"
                      placeholder="Destination tag"
                      type="text"
                    />
                  )}

                  <Field
                    component={InputField}
                    name="express_checkout[email]"
                    placeholder="Your email address for payment notifications"
                    type="email"
                  />

                  {expressCheckoutForm.pay_amount &&
                    expressCheckoutForm.receive_amount && (
                      <p className="order-summary">
                        {'After paying '}
                        <i>{'exactly '}</i>
                        <b>{`${expressCheckoutForm.pay_amount} ${
                          currentPayCurrency.isoSymbol
                        } `}</b>
                        {' you will receive '}

                        <i>{'approximately '}</i>

                        <b>{`${expressCheckoutForm.receive_amount} ${
                          currentReceiveCurrency.isoSymbol
                        }`}</b>

                        {
                          ' within 24 hours. The exchange rate may slightly vary while you complete the payment. We will notify you about the progress of your order by email.'
                        }
                      </p>
                    )}

                  <Field
                    component={CheckboxField}
                    name="express_checkout[terms]"
                  >
                    {'Accept '}
                    <a href="/tos" rel="noopener noreferrer" target="_blank">
                      {'Terms and Conditions'}
                    </a>
                  </Field>

                  <div className="proceed-to-checkout">
                    <Button
                      disabled={invalid}
                      htmlType="submit"
                      loading={submitting}
                      type="primary"
                    >
                      {'Proceed to checkout'}
                    </Button>
                  </div>
                </Form>
              )
            }
          })()}
        </div>
      </div>
    )

    return (
      <div className="express-buy-form">
        {expressCheckoutState.redirecting ? (
          <Spin tip="Wait while we redirect you to invoice page...">
            {form}
          </Spin>
        ) : (
          form
        )}
      </div>
    )
  }
}

const validate = (values, state) => {
  const errors = { express_checkout: { additional_fields: {} }, _error: '' }

  if (!values.express_checkout || !values.express_checkout.pay_amount) {
    errors._error = 'required'
  } else {
    if (
      values.express_checkout.pay_amount <
      state.expressCheckoutState.minPayAmount
    ) {
      errors.express_checkout.pay_amount = `Min. amount is ${
        state.expressCheckoutState.minPayAmount
      }`
    } else if (
      values.express_checkout.pay_amount >
      state.expressCheckoutState.maxPayAmount
    ) {
      errors.express_checkout.pay_amount = `Max. amount is ${
        state.expressCheckoutState.maxPayAmount
      }`
    }
  }

  if (!values.express_checkout || !values.express_checkout.receive_amount) {
    errors._error = 'required'
  }

  if (!values.express_checkout || !values.express_checkout.withdrawal_address) {
    errors._error = 'required'
  } else {
    if (
      !walletAddressValidator(
        values.express_checkout.withdrawal_address,
        state.currentReceiveCurrency.isoSymbol
      )
    ) {
      errors.express_checkout.withdrawal_address = `${
        state.currentReceiveCurrency.title
      } address is not valid`
    }
  }

  if (!values.express_checkout || !values.express_checkout.email) {
    errors._error = 'required'
  } else {
    if (!emailValidator(values.express_checkout.email)) {
      errors.express_checkout.email = 'Email address is not valid'
    }
  }

  if (!values.express_checkout || !values.express_checkout.terms) {
    errors._error = 'required'
  }

  return errors
}

const selector = formValueSelector('expressCheckoutForm')

const ExpressCheckoutReduxed = connect(state => {
  const expressCheckoutForm = selector(state, 'express_checkout')
  const currencyRates = (state.currencyRates && state.currencyRates.rates) || {}

  const currentPayCurrency =
    state.expressCheckoutState.payCurrencies.find(
      curr => curr.id == expressCheckoutForm.pay_currency_id
    ) || {}

  const currentReceiveCurrency =
    state.expressCheckoutState.receiveCurrencies.find(
      curr => curr.id == expressCheckoutForm.receive_currency_id
    ) || {}

  const currentPayReceiveCurrencyRate =
    currentPayCurrency &&
    currentReceiveCurrency &&
    currencyRates[currentPayCurrency.isoSymbol] &&
    currencyRates[currentPayCurrency.isoSymbol][
      currentReceiveCurrency.isoSymbol
    ]

  const currentReceivePayCurrencyRate =
    currentPayCurrency &&
    currentReceiveCurrency &&
    currencyRates[currentReceiveCurrency.isoSymbol] &&
    currencyRates[currentReceiveCurrency.isoSymbol][
      currentPayCurrency.isoSymbol
    ]

  return {
    expressCheckoutState: state.expressCheckoutState,
    expressCheckoutForm,
    currentPayCurrency,
    currentReceiveCurrency,
    currentPayReceiveCurrencyRate,
    currentReceivePayCurrencyRate,
  }
})(
  reduxForm({
    form: 'expressCheckoutForm',
    validate
  })(ExpressCheckout)
)

export default ExpressCheckoutReduxed
