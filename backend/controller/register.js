const Register = require('../model/register');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_OsHMDeUHyD0PzwSldeveAp3200IKMCJJrd');
const User = require('../model/user');
// const nodemailer = require('nodemailer-smtp-transport');
// const sendgridTransport = require('nodemailer-sendgrid-transport');

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use TLS
    auth: {
        user: "shoaibshk.1997@gmail.com",
        pass: "sadvance19070"
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
})

exports.createCustomer = (req, res, next) => {
    const pId = req.body.pId;
    const username = req.body.username;
    const userId = req.body.userId;
    const matchId = req.body.matchId;
    const paymentStatus = req.body.paymentStatus;
    const amount = req.body.amount;
    // const custId = req.body.custId;
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            errorMessage: errors.array()[0].msg,
            oldInput: {
                pId: pId,
                username: username,
            },
            validationErrors: errors.array()
        });
    }

    (async () => {
        let customerID
        let resCustomerId
        let cardId
        let paymentSecretKey
        Register.findOne({ userId: userId })
            .then(result => {
                if (result && result.custId) {
                    console.log('create charge');
                    stripe.charges.create({
                        amount: req.body.amount,
                        currency: "usd",
                        source: req.body.source, // obtained with Stripe.js
                        description: "Charge for alpha"
                    }, function (err, charge) {
                        console.log('charge created');
                    });
                    stripe.customers.createSource(
                        result.custId,
                        {
                            source: req.body.source,
                        },
                        function (err, card) {
                            console.log('card created', card);
                            stripe.customers.update(result.custId, {
                                default_source: card.id
                            });
                        }
                    );

                    stripe.paymentIntents.create({
                        amount: req.body.amount,
                        currency: 'usd',
                        payment_method_types: ['card'],
                    }, function (err, paymentIntent) {
                        paymentSecretKey = paymentIntent.client_secret
                        console.log('payment key', paymentSecretKey);
                        console.log('payment intent created');

                        // console.log('payment Intent created for old');
                        result.paymentSecretKey = paymentSecretKey;
                    })
                    res.send(result);

                } else {
                    console.log(' registration of new user');
                    const customer = stripe.customers.create({
                        source: req.body.source,
                        email: req.body.email,
                    }, async function (err, customer) {
                        console.log('customer created', customer);
                        console.log('@@@@customer id response', resCustomerId);
                        console.log('default_source', customer.default_source);

                        resCustomerId = customer.id;
                        cardId = customer.default_source;


                        const register = new Register({
                            pId: pId,
                            username: username,
                            paymentStatus: paymentStatus,
                            custId: resCustomerId,
                            userId: userId,
                            cardId: cardId,
                            matchId: matchId,
                        })
                        register.save()
                            .then(
                                Register.
                                    find().
                                    populate('userId').
                                    populate('matchId').
                                    exec(result => {
                                        res.send(result);
                                    })
                            )
                    });

                    stripe.charges.create({
                        amount: req.body.amount,
                        currency: "usd",
                        source: req.body.source, // obtained with Stripe.js
                        description: req.body.username
                    }, function (err, charge) {
                        console.log('charge is ', charge);
                    });
                }
            })
    })();

}















// Register.find()
//     .then(result => {
//         CustomerID = result.custId;
//         result.map(async function (value, key) {
//             CustomerID = value.custId
//             console.log('%%%', CustomerID);
//         });
//     })
