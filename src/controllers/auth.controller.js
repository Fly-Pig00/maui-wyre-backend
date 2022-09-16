const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, fintechService } = require('../services');
const { OAuth2Client } = require("google-auth-library");
const config = require('../config/config');
const { User } = require('../models');

//Google Auth
const googleClient = new OAuth2Client({
  clientId: `${config.google.clientId}`,
});

const googleLogin = catchAsync(async (req, res) => {

  // const { token } = req.body;
  // const ticket = await googleClient.verifyIdToken({
  //   idToken: token,
  //   requiredAudience: `${config.google.clientId}`,
  // });
  // const payload = ticket.getPayload();

  const { email } = req.body;
  const user = await authService.loginUserWithGoogleEmail(email);
  const wyreUser = await fintechService.getWyreUserInfo(user.userId);
  if (wyreUser.status === 'error') {
    res.status(httpStatus.BAD_REQUEST).send(wyreUser.data);
    return;
  }
  const tokens = await tokenService.generateAuthTokens(user);
  console.log(wyreUser)
  res.send({ user, tokens, wyreUser: wyreUser.data });
});

const googleSignUp = catchAsync(async (req, res) => {

  const { email, name, password, firstName, lastName } = req.body;
  const user = await userService.createUser({ email, name, password: 'a' + password, firstName, lastName });
  const tokens = await tokenService.generateAuthTokens(user);
  const wyreUser = await fintechService.createWyreUser();

  res.status(httpStatus.CREATED).send({ user, tokens, wyreUser });
});

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  const wyreUser = await fintechService.createWyreUser();
  res.status(httpStatus.CREATED).send({ user, tokens, wyreUser });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const wyreUser = await fintechService.getWyreUserInfo(user.userId);
  if (wyreUser.status === 'error') {
    res.status(httpStatus.BAD_REQUEST).send(wyreUser.data);
    return;
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens, wyreUser: wyreUser.data });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleLogin,
  googleSignUp
};
