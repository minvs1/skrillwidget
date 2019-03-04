// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'antd'

import MainWrapper from '../MainWrapper'

import ExpressCheckout from '../ExpressCheckout'

import './styles.sass';

ReactDOM.render(
  <MainWrapper>
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <div>
            <div>
              <h1>{'Buy Bitcoin with Skrill'}</h1>

              <p>
                {
                  'With CoinGate, you can purchase Bitcoin, Ether, Litecoin and Altcoins with your Skrill wallet instantly. No registration, instant payment confirmation, payout within 24 hours!'
                }
              </p>
            </div>
          </div>

          <div>
            <div>
              <ExpressCheckout gateway="skrill" />

              <img
                src="https://static.coingate.com/images/logo/skrill-logo-gradient.svg"
                style={{ filter: 'brightness(0) invert(1)', marginTop: 5 }}
                width="50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="supported-coins">
        <div>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/btc.png" />
          </span>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/eth.png" />
          </span>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/ltc.png" />
          </span>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/xrp.png" />
          </span>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/dash.png" />
          </span>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/bch.png" />
          </span>
          <span>
            <img src="https://static.coingate.com/images/currencies/32x32/zec.png" />
          </span>
        </div>
      </div>

      <div className="steps">
        <div>
          <div>
            <div>{'1'}</div>
            <h3>{'Choose currency and amount'}</h3>
          </div>
          <div>
            <div>{'2'}</div>
            <h3>{'Enter your email and payout address'}</h3>
          </div>
          <div>
            <div>{'3'}</div>
            <h3>{'Complete the instant Skrill payment'}</h3>
          </div>
          <div>
            <div>{'4'}</div>
            <h3>{'Receive crypto to your address within 24 hours!'}</h3>
          </div>
        </div>
      </div>

      <div className="benefits-of-skrill">
        <div>
          <h2>{'The benefits of buying crypto with Skrill'}</h2>

          <div>
            <div>
              <h3>{'No accounts needed'}</h3>
              <p>
                {
                  'Buy cryptocurrencies without registering an account. Smooth payment experience is guaranteed.'
                }
              </p>
            </div>
            <div>
              <h3>{'Instant checkout'}</h3>
              <p>
                {
                  'Choose your desired currency, amount and proceed to checkout. No added steps!'
                }
              </p>
            </div>
            <div>
              <h3>{'Low fees'}</h3>
              <p>
                {
                  'Buying crypto with credit card can cost 10% or more. With CoinGate, what you see is what you get!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="looking-for-other">
        <div>
          <div>
            <h2>{'Looking for other options to buy cryptocurrencies?'}</h2>
            
            <p>{'With CoinGate, you can buy Bitcoin, Litecoin, Ethereum, Bitcoin Cash, Dash, Ripple and other coins using a range of payment methods. Other than credit card and debit card payments, we support EU SEPA bank transfers, direct bank transfers in Asia, mobile balance, and integrated options such as QQpay.'}</p>
            
            <p>{'CoinGate sources its prices from the largest exchanges, giving your the real-time market rate. Our pricing is transparent, without hidden fees or margins – CoinGate always displays the commission rate charged. Getting started with our platform is simple and convenient. Simply create an account, verify your ID and make your first purchase in less than 24 hours.'}</p>
            
            <Button href="https://coingate.com/buy" type="primary">Learn More</Button>
          </div>
          
          <img alt="CoinGate offers a range of options to buy Bitcoin, Litecoin, Ethereum, Dash, Ripple and other coins" src="https://static.coingate.com/images/pages/buy/skrill/bank-transfer.png" />
        </div>
      </div>
    </div>
  </MainWrapper>,
  document.getElementById('root')
)


export default App;