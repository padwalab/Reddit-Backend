import { kafka, responses } from "../kafka.js";

export const communityAnalyticsResConsumer = kafka.consumer({
  groupId: "analytics-backend",
});

communityAnalyticsResConsumer.connect();
communityAnalyticsResConsumer.subscribe({
  topic: "analytics_response",
});

communityAnalyticsResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
