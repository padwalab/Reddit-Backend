import { kafka, responses } from "../kafka.js";

export const moderationResConsumer = kafka.consumer({
  groupId: "moderation-backend",
});

moderationResConsumer.connect();
moderationResConsumer.subscribe({
  topic: "moderation_response",
});

moderationResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
