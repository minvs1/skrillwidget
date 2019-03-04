// @flow
import React from 'react'
import { Provider } from 'react-redux'

import { createStore, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { reducer as formReducer } from 'redux-form'
import promise from 'redux-promise'
import { composeWithDevTools } from 'redux-devtools-extension'

import reducers from './reducers'

const sagaMiddleware = createSagaMiddleware()

const reducer = combineReducers({
  ...reducers,
  form: formReducer
})

const configureStore = () => {
  const store = createStore(reducer)

  return {
    ...store,
    runSaga: sagaMiddleware.run
  }
}

type Props = {
  children: any
}

App.Store = configureStore()

class MainWrapper extends React.Component<Props, {}> {
  render() {
    return (
      <Provider store={App.Store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default MainWrapper
