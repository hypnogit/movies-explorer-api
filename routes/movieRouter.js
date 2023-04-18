const movieRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getMovies, postMovie, deleteMovie,
} = require('../controllers/controller');
const { urlRegex } = require('../utils/consts');

movieRouter.get('/movies', getMovies);

movieRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    trailerLink: Joi.string().required().regex(urlRegex),
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(urlRegex),
    thumbnail: Joi.string().required().regex(urlRegex),
    movieId: Joi.number().required(),
  }),
}), postMovie);

movieRouter.delete('/movies/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().length(24).hex().required(),
  }),
}), deleteMovie);

module.exports = {
  movieRouter,
};
