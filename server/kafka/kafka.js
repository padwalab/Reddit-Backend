import { Kafka } from "kafkajs";

export let kafka = new Kafka({
  clientId: "reddit-backend",
  brokers: ["reddit_kafka:9092"],
});
