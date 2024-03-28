import dotenv from 'dotenv'
import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

dotenv.config()

const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 --docid [docId]')
  .option('docid', {
    alias: 'd',
    description: 'Document ID to fetch',
    type: 'string',
    demandOption: true,
  })
  .help()
  .alias('help', 'h').argv

const docId = argv.docid

let url = `https://api.voiceflow.com/v3/projects/${process.env.VF_PROJECT_ID}/knowledge-base/documents/${docId}/download`

let options = {
  method: 'GET',
  headers: {
    accept: 'application/json, text/plain, */*',
    clientkey: process.env.VF_CLIENT_KEY,
    Authorization: process.env.VF_API_KEY,
  },
}

async function fetchAndSaveFile(url, options) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const json = await res.json() // Assuming the response is JSON containing a Buffer
    const buffer = Buffer.from(json.data) // Convert the data array back into a Buffer

    const type = await fileTypeFromBuffer(buffer) // Detect file type from the Buffer

    const fileName = `${docId}.${type ? type.ext : ''}`
    fs.writeFile(fileName, buffer, (err) => {
      if (err) {
        throw err
      }
      console.log(`The file has been saved as ${fileName}!`)
    })
  } catch (err) {
    console.error('Error:', err)
  }
}

// Call the async function with your URL and options
fetchAndSaveFile(url, options).catch((err) => console.error('error:', err))
