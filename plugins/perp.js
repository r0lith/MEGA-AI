import fetch from 'node-fetch'

const indexedModels = {
  "1": {
    name: "sonar-pro",
    desc: "Flagship model, deep research, large context, real‑time web search, best for professional and detailed queries."
  },
  "2": {
    name: "sonar",
    desc: "Fast, general-purpose model with web search. Great for everyday questions and fact checking."
  },
  "3": {
    name: "sonar-deep-research",
    desc: "In-depth research/expert synthesis with high citation density. Use for comprehensive answers."
  },
  "4": {
    name: "sonar-reasoning-pro",
    desc: "Advanced reasoning, multi-step logic, and explanation. Good for complex problems or puzzle-like queries."
  },
  "5": {
    name: "sonar-reasoning",
    desc: "Optimized for concise logical Q&A; efficient and direct."
  },
  "6": {
    name: "r1-1776",
    desc: "Specialized, uncensored, no web search. Factual/direct outputs."
  }
}

function formatPerplexityForWhatsApp(text) {
  if (!text) return '';

  // Remove <tags>
  text = text.replace(/<[^>]+>/g, '');

  // Bold: **word** → *word*
  text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');

  // Italics: *word* → _word_
  text = text.replace(/\*(.*?)\*/g, '_$1_');

  // Remove [number] citations
  text = text.replace(/\[\d+\]/g, '');

  // Clean up triple+ newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Remove starting/ending whitespace
  text = text.trim();

  return text;
}

// Add the JIDs (as strings) you want to allow here
//const allowedJIDs = [
 // "919737825303@s.whatsapp.net", // Example JID
  //"919667414383@s.whatsapp.net"
  // Add more as needed
//]

// rwait and done are react emoji (fill as you use in your bot)
const rwait = "⏳";
const done = "✅";

let handler = async (m, { text, conn, isOwner }) => {
  // Only allow specified JIDs
 // if (!allowedJIDs.includes(m.sender)) {
  //  throw `This feature is temporarily turned off by the owner.`;
 // }

  if (!text && !(m.quoted && m.quoted.text)) {
    throw `Please provide some text or quote a message to get a response.`
  }
  if (!text && m.quoted && m.quoted.text) {
    text = m.quoted.text
  }

  // Parse the index and content
  const match = text.trim().match(/^([1-6])\s+(.+)/)

  // If no model index is found, show model list and usage
  if (!match) {
    let list = `*Choose a Perplexity model for your query:*\n\n`
    for (const [idx, { name, desc }] of Object.entries(indexedModels)) {
      list += `*${idx}*.  *${name}*\n   — ${desc}\n`
    }
    list += `\n*How to use:* \nType \`!plex [model_number] your question here\`\n*Example:*\n\`!plex 1 What is quantum mechanics?\`\n`
    await conn.sendMessage(m.chat, { text: list }, { quoted: m })
    return
  }

  const modelIndex = match[1]
  const promptText = match[2]
  const modelName = indexedModels[modelIndex].name

  try {
    m.react(rwait)
    conn.sendPresenceUpdate('composing', m.chat)

    const payload = {
      model: modelName,
      messages: [{ role: "user", content: promptText }],
      temperature: 0.7
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('Perplexity API response:', data)

    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      let result = data.choices[0].message.content
      const formatted = formatPerplexityForWhatsApp(result);
      // WhatsApp message limit is 4096 characters; send in chunks if needed.
      if (formatted.length > 4000) {
        const parts = formatted.match(/.{1,4000}(\s|$)/g);
        for (let part of parts) {
          await conn.sendMessage(m.chat, { text: part.trim() }, { quoted: m });
        }
      } else {
        await conn.sendMessage(m.chat, { text: formatted }, { quoted: m });
      }
      m.react(done)
    } else if (data.error && data.error.message) {
      await conn.sendMessage(m.chat, { text: `Perplexity API Error: ${data.error.message}` }, { quoted: m })
      throw new Error(`Perplexity API Error: ${data.error.message}`)
    } else {
      throw new Error('Invalid response from Perplexity API')
    }
  } catch (error) {
    console.error('Error:', error)
    throw `*ERROR*`
  }
}

handler.help = ['perp']
handler.tags = ['AI']
handler.command = ['plex', 'perplexity']

export default handler