type toastType = 'info' | 'success' | 'warning' | 'error'

const typeColorMap: { [key in toastType]: string } = {
  info: '90',
  success: '32',
  warning: '93',
  error: '91'
}

export const toast = (type?: toastType, ...message: any[]) => {
  if (message.length === 0) {
    console.log('\r')
    return
  }
  const color = (typeColorMap[type] || typeColorMap.info)
  const colorHex = color.replace('#', '0x')
  console.log(`\x1b[${colorHex}m`, message.join(' '), '\x1b[0m')
}