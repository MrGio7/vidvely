//  delete access_token and refresh_token cookies using nookies library

import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", ["access_token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT", "refresh_token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"]);

  res.json(`${env.COGNITO_DOMAIN}/logout?client_id=${env.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${env.NEXT_ORIGIN}`);
}
