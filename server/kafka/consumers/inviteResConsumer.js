import { kafka, responses } from "../kafka.js";

export const inviteResConsumer = kafka.consumer({
  groupId: "invite-backend",
});

inviteResConsumer.connect();
inviteResConsumer.subscribe({
  topic: "invite_response",
});

inviteResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
