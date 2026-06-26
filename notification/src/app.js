import express from 'express'
import morgan from 'morgan'
import { sendEmail } from './email.js'
import channel from './mq.js'

const app = express()
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.send('Hello from Notification Service!')
})

app.get('/_status/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.get('/_status/readyz', (req, res) => {
    res.status(200).json({ status: 'ready' })
})

channel.consume('auth_notification_queue', async (msg) => {
    if(msg !== null){
        const messageContent = msg.content.toString();
        console.log('Received Message from Queue', messageContent)

        try{
            const { userId, action, timestamp, email } = JSON.parse(messageContent);
            
            const subject = 'New Login Notification'
            const text = `A new login was detected for your account at ${timestamp}. If this wasn't you then, Please change your password and Secure your account.`
            const html = `<p>A new login was detected for your account at <strong>${timestamp}</strong>. If this wasn't you then, Please change your password and Secure your account.</p>`
            await sendEmail(email, subject, text, html)

            channel.ack(msg)
        } catch(error){
            console.log('Error processing Message', error)
        }
    } else{
        console.log('Received Null Message')
    }
})

export default app