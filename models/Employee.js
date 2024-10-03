const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    designation: { type: String, required: true },
    gender: { type: String, required: true },
    course: {
        MCA: { type: Boolean, default: false },
        BCA: { type: Boolean, default: false },
        BSC: { type: Boolean, default: false }
    },
    imageUrl: { type: String }  
});

module.exports = mongoose.model('Employee', employeeSchema);
