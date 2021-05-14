import { kafka, responses } from "../kafka.js";

export const messageResConsumer = kafka.consumer({
  groupId: "messages-backend",
});

messageResConsumer.connect();
messageResConsumer.subscribe({ topic: "messages_response" });

messageResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
