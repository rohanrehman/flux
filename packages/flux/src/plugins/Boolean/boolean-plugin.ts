export const schema = (o: any) => typeof o === 'boolean'

export const sanitize = (v: any): boolean => {
  if (typeof v !== 'boolean') throw Error('Invalid boolean')
  return v
}
