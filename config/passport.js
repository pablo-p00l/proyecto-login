const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. Buscar si ya existe un usuario con este googleId
                let usuario = await User.findOne({ googleId: profile.id });

                if (usuario) {
                    // Ya existía, lo dejamos pasar tal cual
                    return done(null, usuario);
                }

                // 2. Si no existe, lo creamos con los datos que nos dio Google
                usuario = await User.create({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    // password: no se manda, el modelo ya sabe que no es obligatorio si hay googleId
                });

                return done(null, usuario);

            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;