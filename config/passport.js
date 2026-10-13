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
        // 1. ¿Ya había entrado antes con Google?
        let usuario = await User.findOne({ googleId: profile.id });
        if (usuario) {
            return done(null, usuario);
        }

        // 2. Datos que nos da Google
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const emailVerificado =
            profile._json.email_verified === true ||
            profile._json.email_verified === 'true';

        // Sin email verificado por Google, no seguimos
        if (!email || !emailVerificado) {
            return done(null, false);
        }

        // 3. ¿Existe una cuenta con ese email (registro tradicional)?
        usuario = await User.findOne({ email });
        if (usuario) {
            usuario.googleId = profile.id;
            await usuario.save();
            return done(null, usuario);
        }

        // 4. Usuario nuevo. El username es único, así que evitamos choques
        let username = profile.displayName;
        if (await User.exists({ username })) {
            username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
        }

        usuario = await User.create({
            username,
            email,
            googleId: profile.id,
        });

        return done(null, usuario);

    } catch (error) {
        return done(error, null);
    }
}
    )
);

module.exports = passport;