const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const User = require("../model/user");
var jwt = require('jsonwebtoken');

// exports.postUser = (req, res, next) => {
//     const registration = new User({
//         email: req.body.email,
//         password: req.body.password
//     });
//     registration.save()
//         .then(create => {
//             req.session.user = create;
//             res.status(201).json({
//                 message: "User created successfully",
//                 registration: {
//                     user: create
//                 }
//             })
//         });
// }

exports.postUser = (req, res, next) => {
    console.log(req.body);

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());

        return res.status(422).json({
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array()
        });

    }
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            res.status(200)
                .send(result)
        })
}



exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email: email })

        .then(user => {
            if (!user) {
                return res.status(422).json({
                    errorMessage: "Invalid email or Password.",
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        console.log(password + user.password);
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        req.session.token = jwt.sign(req.body, 'shhh');
                        return req.session.save(err => {
                            console.log(err);
                            res.status(200).json(req.session);
                        });
                    }
                    return res.status(422).json({
                        errorMessage: "Invalid email or Password.",
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    // res.redirect("/login");
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
    });
}
