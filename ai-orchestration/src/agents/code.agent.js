import 'dotenv/config'
import { ChatMistralAI } from '@langchain/mistralai'
import { createAgent } from 'langchain'
import { listFiles, readFiles, updateFiles } from './tools.js'

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRALAI_API_KEY
})

const agent = createAgent({
    model,
    tools: [listFiles, updateFiles, readFiles],
})

await agent.invoke({
    messages: [
        {
            role: 'user',
            content:`
                create a snake simple game in the project, using react and css.
                Continue calling tools until the task is complete.
            `
        }
    ]
})