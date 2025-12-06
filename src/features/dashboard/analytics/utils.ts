export const currencyFormatter = (value: number) =>
  `${value >= 0 ? '' : '-'}${Math.abs(value).toLocaleString()}`

export const percentFormatter = (value: number) => `${value.toFixed(2)}%`
