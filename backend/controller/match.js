const Match = require('../model/match');
const { validationResult } = require('express-validator');
const Register = require('../model/register');
const mongoose = require('mongoose');
waterfall = require('run-waterfall')
async = require('async')


exports.postData = (req, res, next) => {
    const type = req.body.type;
    const version = req.body.version;
    const map = req.body.map;
    const fees = req.body.fees;
    const win = req.body.win;
    const perkill = req.body.perkill;
    const date = req.body.date;
    const time = req.body.time;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());

        return res.status(422).json({
            errorMessage: errors.array()[0].msg,
            oldInput: {
                type: type,
                version: version,
            },
            validationErrors: errors.array()
        });

    }

    const match = new Match({
        type: type,
        version: version,
        map: map,
        fees: fees,
        win: win,
        perkill: perkill,
        date: date,
        time: time

    })
    match.save()
        .then(result => {
            res.status(200).send(result);
        })
}

// exports.getData = (req, res, next) => {
//     Match.find({})
//         .then(result => {
//             res.status(200).send(result);
//         });
// }

exports.getData = (req, res, next) => {
    var matchcount;
    var value;
    waterfall([
        function (callback) {
            Match.aggregate([
                { $lookup: { from: 'Register', localField: '_id', foreignField: 'matchId', as: 'Register' } }
            ])
                .allowDiskUse(true)
                .exec(async function (err, pmcount) {
                    if (err) {
                        callback(err);
                    } else {
                        var finalResponse = [];
                        // console.log("pmcount   ", pmcount);
                        pmcount.map(async function (value, key) {
                            var cn = 0;
                            await Register.count({ matchId: mongoose.Types.ObjectId(value._id) },
                                async function (err, matchCount) {
                                    if (err) {
                                        console.log(err);
                                        (err);
                                    } else {
                                        cn = matchCount;
                                        value.count = await cn;
                                        
                                    }
                                })
                            console.log('value is', value);
                            finalResponse.push(value);
                            callback(null, finalResponse);
                            // console.log("finalResponse    ", finalResponse);

                        });        
                    }
                });
        }, function (arg1, totalManagerCount, callback) {
            // console.log('totalManagerCount', arg1);

            var finalResponse = [];
            finalResponse.push(arg1);
            //  console.log('finalResponse', finalResponse);
            callback(null, finalResponse, totalManagerCount);

        }], function (err, result, totalManagerCount) {

            // console.log("result   ===================", result);
            if (result.count === 100 ) {
                 res.json({ code: '400', message: 'tournament full'});
                console.log('tournament full');

            } else {
                res.json({ code: '200', data: result, total_manager: totalManagerCount });
            }
        });
}



// var matchcount = new Array();
// var matches = [];
// Match.aggregate([
//     {
//         $lookup:
//             { from: 'Register', localField: '_id', foreignField: 'matchId', as: 'Register' }
//     },

// ])
    // .allowDiskUse(true)
    // .exec(async function (err, results) {
    //     if (results) {
    //         console.log('result is', results);
            // await results.map(async function (value, key) {
            //     console.log('+>');
            //     await Register.count({ matchId: mongoose.Types.ObjectId(value._id) }, async function (err, matchCount) {
            //         if (err) {
            //             console.log(err);
            //             (err);
            //         } else {
            //             matchcount.push(value._id, matchCount);
            //             value.matchCount = matchCount;
            //             // await matchcount;
            //             console.log('=>');
            //         }
            //     })
            //     await matches.push(value); 
            //     console.log('matches', matches);
            // })
            //  console.log('@@@@@', matches);
            // res.status(200).json(matches);

            // var response = await matches;
            // // console.log('matchcount', matchcount);
            // console.log('response', response);
            // await matchcount;
    //     } else {
    //         console.log('result not found!');
    //     }

    // })
