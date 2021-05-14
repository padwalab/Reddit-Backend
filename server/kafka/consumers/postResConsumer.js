import { kafka, responses } from "../kafka.js";

export const postResConsumer = kafka.consumer({
  groupId: "post-backend",
});

postResConsumer.connect();
postResConsumer.subscribe({
  topic: "post_response",
});

postResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
