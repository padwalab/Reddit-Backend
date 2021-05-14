import { kafka, responses } from "../kafka.js";

export const communityHomeResConsumer = kafka.consumer({
  groupId: "commhome-backend",
});

communityHomeResConsumer.connect();
communityHomeResConsumer.subscribe({
  topic: "commhome_response",
});

communityHomeResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
