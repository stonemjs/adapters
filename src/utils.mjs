import ipRangeCheck from 'ip-range-check'

export const isFromTrustedProxy = (options) => (ip) => {
  const trusted = options.proxies.trusted ?? []
  const untrusted = options.proxies.untrusted ?? []

  if (untrusted.includes('*') || ipRangeCheck(ip, untrusted)) {
    return false
  }

  if (trusted.includes('*') || ipRangeCheck(ip, trusted)) {
    return true
  }

  return true
}