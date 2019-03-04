import WAValidator from 'wallet-address-validator'

const emailValidator = email => {
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return email && re.test(String(email).toLowerCase())
}

const walletAddressValidator = (address, currency) => {
  try {
    return WAValidator.validate(
      address,
      currency,
      //App.State.Environment == 'production' ? 'prod' : 'testnet'
    )
  } catch (e) {
    return 'NOCURRENCY'
  }
}

export { emailValidator, walletAddressValidator }