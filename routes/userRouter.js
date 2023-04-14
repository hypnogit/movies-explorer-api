const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateProfile, getUserInfo, createUser, login,
} = require('../controllers/controller');
const { auth } = require('../middlewares/auth');

userRouter.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);

userRouter.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

userRouter.use(auth);

userRouter.get('/users/me', getUserInfo);

userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), updateProfile);

module.exports = {
  userRouter,
};
