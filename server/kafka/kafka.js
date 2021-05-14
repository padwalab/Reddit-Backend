import { Kafka } from "kafkajs";

export let kafka = new Kafka({
  clientId: "reddit-backend",
  brokers: ["reddit_kafka:9092", "reddit_kafka_2:9092"],
});

export const responses = {};
