import React from 'react'
import { Select } from 'antd'

const Option = Select.Option

const CurrencyAddon = field => {
  const handleChange = value => {
    if (field.onSelect) {
      field.onSelect(value)
    }

    if (field.onChange) {
      field.onChange(value)
    }

    if (field.input.onChange) {
      field.input.onChange(value)
    }
  }

  return (
    <div id={field.id}>
      <Select
        className={field.className}
        dropdownMatchSelectWidth={false}
        onChange={handleChange}
        optionLabelProp="isosymbol"
        value={field.input.value}
      >
        {field.options.map(currency => {
          return (
            <Option
              isosymbol={currency.isoSymbol}
              key={currency.value}
              value={currency.value}
            >
              {currency.title}
            </Option>
          )
        })}
      </Select>
    </div>
  )
}

export default CurrencyAddon