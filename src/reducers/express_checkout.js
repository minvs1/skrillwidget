const initialState = {
  payCurrencies: [],
  receiveCurrencies: [],
  loading: true,
  redirecting: false,
  lastInput: 'pay'
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'EXPRESS_CHECKOUT_SET_DATA':
      return {
        ...state,
        payCurrencies: action.payCurrencies,
        receiveCurrencies: action.receiveCurrencies,
        fee: action.fee,
        loading: action.loading,
        minPayAmount: action.min_pay_amount,
        maxPayAmount: action.max_pay_amount
      }
    case 'EXPRESS_CHECKOUT_SET_LAST_INPUT':
      return {
        ...state,
        lastInput: action.input
      }
    case 'EXPRESS_CHECKOUT_SET_REDIRECTING':
      return {
        ...state,
        redirecting: action.redirecting
      }
    default:
      return state
  }
}
