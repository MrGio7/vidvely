import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from "amazon-cognito-identity-js";
import { serialize } from "cookie";

export interface Credentials {
  email: string;
  password: string;
}

export interface ConfirmVerificationCodeInput {
  user: string;
  code: string;
}

export interface ResendVerificationCodeInput {
  user: string;
}

export const poolData = {
  UserPoolId: "eu-central-1_3JGV6ob34",
  ClientId: "3cermrrihd00fn1742frogg4ip",
};

export const userPool = new CognitoUserPool(poolData);

function signUp(credentials: Credentials) {
  userPool.signUp(credentials.email, credentials.password, [], [], function (err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    var cognitoUser = result?.user;
    console.log("user name is " + cognitoUser?.getUsername());
  });
}

function confirmVerificationCode({ code, user }: ConfirmVerificationCodeInput) {
  const cognitoUser = new CognitoUser({
    Pool: userPool,
    Username: user,
  });

  cognitoUser.confirmRegistration(code, true, function (err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    console.log("call result: " + result);
  });
}

function resendVerificationCode({ user }: ResendVerificationCodeInput) {
  const cognitoUser = new CognitoUser({
    Pool: userPool,
    Username: user,
  });

  cognitoUser.resendConfirmationCode(function (err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    console.log("call result: " + result);
  });
}

function signIn({ email, password }: Credentials) {
  const cognitoUser = new CognitoUser({
    Pool: userPool,
    Username: email,
  });

  const authenticationDetails = new AuthenticationDetails({ Username: email, Password: password });

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      const accessToken = result.getAccessToken().getJwtToken();
      const accessTokenExp = result.getAccessToken().getExpiration();
      const refreshToken = result.getRefreshToken().getToken();
      const idToken = result.getIdToken().getJwtToken();
      const idTokenExp = result.getIdToken().getExpiration();

      return {
        accessToken,
        accessTokenExp,
        refreshToken,
        idToken,
        idTokenExp,
      };
    },

    onFailure: function (err) {
      alert(err.message || JSON.stringify(err));
    },
  });
}

export { signUp, confirmVerificationCode, signIn };
