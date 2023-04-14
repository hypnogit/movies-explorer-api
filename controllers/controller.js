const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user');
const Movie = require('../models/movie');
const { BadRequest } = require('../utils/BadRequest');
const { Conflict } = require('../utils/Conflict');
const { NotFound } = require('../utils/NotFound');
const { Unauthorized } = require('../utils/Unauthorized');
const { Forbidden } = require('../utils/Forbidden');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .orFail(() => {
      next(new NotFound('Запрашиваемый пользователь не найден'));
    })
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequest('Получены неккоретные данные'));
      } else {
        next(error);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        email, password: hash, name,
      })
        .then((user) => {
          res.send({
            email: user.email, name: user.name, _id: user._id,
          });
        })
        .catch((error) => {
          if (error.code === 11000) {
            next(new Conflict('Пользователь с таким емейлом уже зарегистрирован'));
          } else if (error.name === 'ValidationError') {
            next(new BadRequest('Получены неккоретные данные'));
          } else {
            next(error);
          }
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((isPasswordValid) => {
          if (!isPasswordValid) {
            return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
          }
          const token = jsonwebtoken.sign({
            _id: user._id,
          }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
          return res.send({
            email: user.email, name: user.name, token,
          });
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch(next);
};

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch((error) => next(error));
};

module.exports.postMovie = (req, res, next) => {
  const id = req.user._id;
  const {
    nameRU,
    nameEN,
    trailerLink,
    country,
    director,
    duration,
    year,
    description,
    image,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    nameRU,
    nameEN,
    trailerLink,
    country,
    director,
    duration,
    year,
    description,
    image,
    thumbnail,
    movieId,
    owner: id,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequest('Получены неккоретные данные'));
      } else {
        next(error);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(() => {
      next(new NotFound('Запрашиваемый фильм не найден'));
    })
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        Movie.deleteOne({ _id: req.params._id })
          .then(() => res.send({ message: 'Фильм удален' }))
          .catch((error) => {
            next(error);
          });
      } else {
        next(new Forbidden('Нельзя удалить чужой фильм'));
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Получены неккоретные данные'));
      } else {
        next(error);
      }
    });
};
