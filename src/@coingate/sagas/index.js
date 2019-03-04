import {put, call, takeLatest} from "redux-saga/effects";

export function* updateCurrencyRates(action) {
  yield put({type: "SET_CURRENCY_RATES_LOADING", loading: true});

  const rates = yield call(() =>
    window.App.Request(
      `/currency-rates/${action.from}/${action.to}`,
      "GET"
    ).then(rates => rates)
  );
  yield put({type: "SET_CURRENCY_RATES", rates});

  yield put({type: "SET_CURRENCY_RATES_LOADING", loading: false});
}

export default function* rootSaga() {
  yield takeLatest("UPDATE_CURRENCY_RATES", updateCurrencyRates);
}
