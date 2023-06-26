import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: randomUUID(),
  brokers: process.env.KAFKA_BROKERS?.split(","),
  ssl: {
    rejectUnauthorized: false,
    ca: [process.env.KAFKA_CA],
    key: process.env.KAFKA_PRIVATE_KEY,
    cert: process.env.KAFKA_CERTIFICATE,
  },
})

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'delta-topic',
      messages: [
        { value: 'Hei på deg!' },
      ],
    });

    response.status(200);
}