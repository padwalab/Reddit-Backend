import { kafka, responses } from "../kafka.js";

export const commentResConsumer = kafka.consumer({
  groupId: "community-backend",
});

commentResConsumer.connect();
commentResConsumer.subscribe({ topic: "community_response" });

commentResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
