import { kafka, responses } from "../kafka.js";

export const messageResConsumer = kafka.consumer({
  // groupId: "messages-backend",
  groupId: process.env.GROUP_ID,
});

messageResConsumer.connect();
messageResConsumer.subscribe({ topic: process.env.LISTEN_TOPIC_NAME });

messageResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    if (responses[data.id] !== undefined || responses[data.id] !== null) {
      responses[data.id].status(data.status).send(data.data);
      delete responses[data.id];
    }
  },
});
