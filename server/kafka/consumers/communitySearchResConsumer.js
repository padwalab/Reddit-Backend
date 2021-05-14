import { kafka, responses } from "../kafka.js";

export const communitySearchResConsumer = kafka.consumer({
  groupId: "commsearch-backend",
});

communitySearchResConsumer.connect();
communitySearchResConsumer.subscribe({ topic: "commsearch_response" });

communitySearchResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
