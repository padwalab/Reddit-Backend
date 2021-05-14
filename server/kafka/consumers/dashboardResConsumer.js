import { kafka, responses } from "../kafka.js";

export const dashboardResConsumer = kafka.consumer({
  groupId: "dashboard-backend",
});

dashboardResConsumer.connect();
dashboardResConsumer.subscribe({
  topic: "dashboard_response",
});

dashboardResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
