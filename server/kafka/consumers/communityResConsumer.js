import { kafka, responses } from "../kafka.js";

export const communityResConsumer = kafka.consumer({
  groupId: "community-backend",
});

communityResConsumer.connect();
communityResConsumer.subscribe({ topic: "community_response" });

communityResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
