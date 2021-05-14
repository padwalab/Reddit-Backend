import { kafka, responses } from "../kafka.js";

export const userResConsumer = kafka.consumer({ groupId: "users-backend" });

userResConsumer.connect();
userResConsumer.subscribe({ topic: "users_response" });

userResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
