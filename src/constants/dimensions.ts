import Form from 'antd/lib/form/Form'

export const CM_PER_INCH = 2.54
export const FORMAT_RATIO = 29.7 / 21

export enum Format {
  A4 = 'A4',
  A3 = 'A3',
  A2 = 'A2',
  A1 = 'A1',
  A0 = 'A0',
}

export const FORMAT_SIZE = {
  [Format.A4]: 29.7,
  [Format.A3]: 42,
  [Format.A2]: 59.4,
  [Format.A1]: 84.1,
  [Format.A0]: 118.9,
}

export const FORMATS = [Format.A4, Format.A3, Format.A2, Format.A1]
