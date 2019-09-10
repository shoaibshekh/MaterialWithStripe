const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registerSchema = new Schema({
    pId: {
        type: String,
        required: true,
        trim: true,
        // unique: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        // unique: true
    },
    paymentStatus: {
        type: Boolean,
        required: true,
    },
    custId: {
        type: String,
        // required: true,
        // unique: true
    },
    cardId: {
        type: String,
    },
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },
    matchId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,

    }
});


// registerSchema.plugin(require('mongoose-autopopulate'));
const Register = mongoose.model('Register', registerSchema);
module.exports = Register;




