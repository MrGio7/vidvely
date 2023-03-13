import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { env } from "~/env.mjs";
import { trpcProxy } from "~/utils/trpc";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      createdAt: string;
      updatedAt: string;
      firstName: string;
      lastName: string;
    };
    token: string;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  theme: { colorScheme: "dark" },

  callbacks: {
    async jwt({ token, account }) {
      if (!account) return token;

      if (Date.now() < account.expires_at! * 1000) {
        token.accessToken = account.access_token;

        return token;
      }

      const client = new CognitoIdentityProviderClient({
        region: "eu-central-1",
      });

      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: env.COGNITO_CLIENT_ID,
        ClientMetadata: {},
        AuthParameters: {
          REFRESH_TOKEN: account.refresh_token!,
          SECRET_HASH: env.COGNITO_CLIENT_SECRET,
        },
      });

      const { AuthenticationResult } = await client.send(command);

      if (!AuthenticationResult)
        throw new Error("AuthenticationResult is undefined");

      token.accessToken = AuthenticationResult?.AccessToken!;

      return {
        ...token,
        accessToken: AuthenticationResult?.AccessToken!,
        accessTokenExpires: !!AuthenticationResult?.ExpiresIn
          ? Date.now() + AuthenticationResult.ExpiresIn * 1000
          : 0,
        refreshToken: account.refresh_token,
      };
    },
    async session({ session, token }) {
      const user = await trpcProxy(
        token.accessToken as string
      ).findOrCreateUser.mutate({});

      session.token = token.accessToken as string;
      session.user = user;

      return session;
    },
  },

  providers: [
    CognitoProvider({
      clientId: env.COGNITO_CLIENT_ID,
      clientSecret: env.COGNITO_CLIENT_SECRET,
      issuer: env.COGNITO_ISSUER,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
