const chalk = require('chalk')
const { watchFile } = require('fs')

/**
 * Styled logger prefix
 */
function logPrefix(error = false) {
  return chalk[error ? 'red' : 'blue']('[Riruru]')
}

/**
 * Main print function
 * @param {Object} m - Serialized Baileys message (sock.serializeM)
 * @param {Object} conn - Baileys socket
 */
async function print(m, conn = { user: {} }) {
  try {
    const isGroup = m.chat?.endsWith('@g.us')
    const chatName = isGroup
      ? await conn.getName(m.chat).catch(() => 'Group')
      : 'Private'

    const senderName = await conn.getName(m.sender).catch(() => 'Unknown')
    const senderJid = m.sender || 'unknown'
    const groupJid = isGroup ? m.chat : ''

    const messageText =
      m.text ||
      m.body ||
      m.caption ||
      '[non-text message]'

    const quotedText =
      m.quoted?.text ||
      m.quoted?.body ||
      m.quoted?.caption ||
      ''

    const time = new Date().toLocaleString()

    let lines = []

    lines.push(chalk.magentaBright('════════ MESSAGE ════════'))
    lines.push(chalk.cyanBright('Time      : ') + chalk.white(time))
    lines.push(chalk.cyanBright('Chat      : ') + chalk.white(chatName))
    lines.push(chalk.cyanBright('Sender    : ') + chalk.white(senderName))
    lines.push(chalk.cyanBright('Sender JID: ') + chalk.gray(senderJid))

    if (isGroup) {
      lines.push(chalk.cyanBright('Group JID : ') + chalk.gray(groupJid))
    }

    lines.push(chalk.cyanBright('Message   :'))
    lines.push(chalk.white(messageText))

    if (quotedText) {
      lines.push(chalk.cyanBright('Quoted    :'))
      lines.push(chalk.white(quotedText))
    }

    lines.push(chalk.magentaBright('═════════════════════════'))

    console.log(logPrefix(), lines.join('\n'))
  } catch (err) {
    console.log(
      logPrefix(true),
      chalk.redBright('Logger error:'),
      err.message
    )
  }
}

/**
 * Hot-reload notice
 */
watchFile(__filename, () => {
  console.log(logPrefix(), chalk.yellow("print.js updated"))
})

module.exports = print
