import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

const log = (text, error = false) =>
  console.log(
    chalk[error ? 'red' : 'blue']('[Riruru v4]'),
    chalk[error ? 'redBright' : 'greenBright'](text)
  )

export default async function (m, conn = { user: {} }) {
  let senderName = await conn.getName(m.sender)

  let chatName = ''
  if (m.chat && m.chat !== m.sender) {
    if (!m.chat.endsWith('@g.us')) {
      chatName = 'Private'
    } else {
      chatName = await conn.getName(m.chat)
      chatName = chatName ? `${chatName}` : ''
    }
  } else {
    chatName = 'Private'
  }

  // Gather additional fields
  const messageId = m.id || m.key?.id || ''
  const participant = m.key?.participant || ''
  const quotedText = m.quoted?.text || ''
  const mentions = m.mentionedJid?.join(', ') || ''
  const timestamp = m.messageTimestamp
    ? new Date(m.messageTimestamp * 1000).toLocaleString()
    : ''
  const mtype = m.mtype || ''
  const device = m.device || ''
  const isGroup = m.chat?.endsWith('@g.us') || false
  const groupJid = isGroup ? m.chat : ''
  const mediaType = m.mediaType || ''
  const senderNumber = m.sender ? m.sender.split('@')[0] : ''
  const msgContent = m.text || ''

  // Organised log output
  let logLines = [
    isGroup ? chalk.cyanBright(`Group JID: `) + chalk.whiteBright(groupJid) : '',
    chalk.magentaBright('--- Message Log ---'),
    chalk.cyanBright(`Chat Name: `) + chalk.whiteBright(chatName),
    chalk.cyanBright(`Sender: `) +
      chalk.whiteBright(`${senderName}`) +
      chalk.gray(' / ') +
      chalk.whiteBright(`${m.sender}`),
    chalk.cyanBright(`Message:`),
    chalk.whiteBright(msgContent),
  ].filter(Boolean)  // remove empty lines

  if (quotedText) {
    logLines.push(chalk.cyanBright(`Quoted Text:`))
    logLines.push(chalk.whiteBright(quotedText))
  }
  logLines.push(chalk.magentaBright('------------------'))

  log(logLines.join('\n'))
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  log(chalk.redBright("Update 'lib/print.js'"), false)
})