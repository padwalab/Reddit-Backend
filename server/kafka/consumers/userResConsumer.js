import { kafka } from "../kafka.js";
import { responses } from "../producers/userReqProducer.js";

export const userResConsumer = kafka.consumer({ groupId: "reddit-backend" });
// export const userResConsumer2 = kafka.consumer({ groupId: "reddit-backend" });
// userResConsumer2.connect();
// userResConsumer2.subscribe({ topic: "users1" });
// userResConsumer2.disconnect();

userResConsumer.connect();
userResConsumer.subscribe({ topic: "users2" });

userResConsumer.run({
  eachMessage: ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    console.log({ ...data, topic });
    responses[data.id].status(data.status).send(data.data);
    delete responses[data.id];
  },
});
