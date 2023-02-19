import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import schema from "./schema/index";
import { z } from "zod";
const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(cors<cors.CorsRequest>(), bodyParser.json({ limit: "50mb" }));

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
);

app.use("/auth", async (req, res) => {
  try {
    const bodyScheme = z.object({
      email: z.string(),
      password: z.string(),
    });

    const body = bodyScheme.safeParse(req.body);

    if (!body.success) return res.status(400).json(body.error.format());

    return res.status(200).json("Hello World");
  } catch (error) {
    console.log(error);

    return res.status(500).json("Error");
  }
});

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
