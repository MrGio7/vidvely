import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import cors from "cors";
import express, { response } from "express";
import http from "http";
import schema from "./schema/index";
import { z } from "zod";
import axios from "axios";
import moment from "moment";
import { CognitoJwtVerifier } from "aws-jwt-verify";

interface AuthData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  cors<cors.CorsRequest>({
    credentials: true,
    origin: "http://localhost:5173",
  }),
  bodyParser.json({ limit: "50mb" })
);

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
);

app.post("/auth", async (req, res) => {
  console.log(req.headers.cookie);

  try {
    const bodyScheme = z.object({
      code: z.string().uuid(),
    });

    const body = bodyScheme.safeParse(req.body);

    if (!body.success) return res.status(400).json(body.error.format());

    const authCode = body.data.code;

    const { id_token, access_token, refresh_token }: AuthData = await axios
      .post(
        "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/token",
        {
          grant_type: "authorization_code",
          client_id: "3cermrrihd00fn1742frogg4ip",
          code: authCode,
          redirect_uri: "http://localhost:5173/",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => res.data)
      .catch((err) => {
        console.error(err);
        throw new Error("auth error");
      });

    const verifier = CognitoJwtVerifier.create({
      userPoolId: "eu-central-1_3JGV6ob34",
      tokenUse: "access",
      clientId: "3cermrrihd00fn1742frogg4ip",
    });

    const { sub: userId } = await verifier.verify(access_token);

    return res
      .status(200)
      .cookie("access_token", access_token, {
        expires: moment().add(1, "hour").toDate(),
        httpOnly: true,
        sameSite: true,
        secure: true,
      })
      .cookie("refresh_token", refresh_token, {
        expires: moment().add(1, "month").toDate(),
        httpOnly: true,
        sameSite: true,
        secure: true,
      })
      .json("auth success");
  } catch (error) {
    console.log(error);

    return res.status(500).json("Internal Server Error");
  }
});

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
