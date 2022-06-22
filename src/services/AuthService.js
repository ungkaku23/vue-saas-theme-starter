import store from "../store";
import { http } from "./HttpService";
import jwt from "jsonwebtoken";
//IMPORT SOKECT.IO
import io from "socket.io-client";
//var socket = io("ws://localhost:3001/", { transports: ["websocket"] });
var socket = io(process.env.VUE_APP_API_URL, { transports: ["websocket"] });
//**************Auth Fucntions ************/
//Function Used To Check if isLoggedIn And Grab Token Authentication
export function isLoggedIn() {
  const user = getSession();
  if (!user) {
    return null;
  } else {
    const hasToken = getToken();
    if (!hasToken) {
      return null;
    } else {
      const decodedToken = decodeToken();
      return decodedToken != null;
    }
  }
}
export function switchTenant(tenantId, userId) {
  return http().get(`/switch-account/${tenantId}/${userId}`);
}
//Login Function
export function login(user) {
  return (
    http()
      .post("/auth", user)
      //After Succed
      .then((res, err) => {
        if (res) {
          //Access User & Token From Response
          setSession(res.data.user);
        } else {
          console.log(err.message);
          //return { message: err.message };
        }
      })
  );
}
//Function For LogOut
export function logout() {
  localStorage.clear();
  //Dispatch The State Through The App
  store.dispatch("authenticate");
}
//Function Register User
export function registerUser(user) {
  return http().post("/register", user);
}
//Function Register User by Invitation
export function registerInvitation(user) {
  return http().post("/register-invitation", user);
}
//Send Email Forgot Password
export function forgotPassword(user) {
  return http().put("/forgot-password", user);
}
//Send Email Reset Password
export function resetPassword(user) {
  return http().put("/reset-password", user);
}
//Resend Email Verification
export function resendEmailConfirm(userId) {
  return http().post("/auth/email/confirm/sent", userId);
}
//**************Session & Token Management *****************/
export function setSession(user) {
  localStorage.setItem("user", JSON.stringify(user));
  //Dispatch The Action To The Store
  store.dispatch("authenticate");
}
//Get User Session
export function getSession() {
  return localStorage.getItem("user");
}
// Extract Token
export function getToken() {
  const user = getSession();
  const parseObj = JSON.parse(user);
  const token = parseObj.token;
  if (!token) {
    return null;
  }
  return token;
}
//Return The Values Come From The Token
export function decodeToken() {
  const token = getToken();
  if (!token) {
    return null;
  }
  return jwt.decode(token);
}
//Update Session Token
export function updateSession(newSessionToken) {
  const currentSession = getSession();
  if (currentSession) {
    //window.localStorage.removeItem("user");
    window.localStorage.setItem("user", JSON.stringify(newSessionToken));
    store.dispatch("authenticate");
  }
}
//**************Get User Informations From Session *****************/
//Function Return image profile
export function getImgProfile() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.imgPath;
}
//Function Retunr AccountID
export function getAccountId() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.accountId;
}
// Function Return UserName
export function getUsername() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.username;
}
// Function Return Email
export function getEmail() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.email;
}
// Function Return UserID
export function getUserId() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.id;
}
// Function Return Role
export function getUserRole() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.role;
}
// Function Return State Email Confirmation
export function getEmailState() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.confirmed;
}
// Function Return customerId
export function getCustomerId() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.stripeCustomerId;
}
//Parsing User Object
export function getUserObj() {
  const stringUser = localStorage.getItem("user");
  const user = JSON.parse(stringUser);
  if (!user) {
    return null;
  }
  return user;
}
// Function Return subscription status
export function getSubStatus() {
  const token = decodeToken();
  if (!token) {
    return null;
  }
  return token.user.subscribed;
}
// Function Return Plan
export function getUserPlan() {
  const user = getUserObj();
  if (!user) {
    return null;
  }
  return user.plan;
}
// Function Return Subscription
export function getUserSubscription() {
  const user = getUserObj();
  if (!user) {
    return null;
  }
  return user.subscription;
}

//SOCKET.IO For Stripe webhooks
socket.on("session", function(data) {
  const payload = data.user;
  getSession(payload);
});

//SOCKET.IO
socket.on("message", function(data) {
  console.log("RECEIVED message", data);
});
