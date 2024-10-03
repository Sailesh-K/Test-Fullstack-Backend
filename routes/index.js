const express = require("express");
const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer=require("multer");
const path=require("path");
const router = express.Router();

const JWT_SECRET = "TEST"; 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type, only JPEG and PNG are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 
    },
    fileFilter: fileFilter
});

router.post('/new', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPass = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPass });
        await user.save();
        return res.status(200).send("New User Successfully Registered");
    } catch (error) {
        res.status(400).send("Error Registering User!!");
    }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send("User not found!");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Incorrect Password");
        }

        
        const token = jwt.sign({ username: user.username, id: user._id }, JWT_SECRET, {
            expiresIn: '1d', 
        });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(400).send(error);
    }
});


const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send("Forbidden: Invalid Token");
            }

            req.user = user; 
            next(); 
        });
    } else {
        res.status(401).send("Unauthorized: Token missing");
    }
};


router.get("/", authenticateJWT, (req, res) => {
    return res.status(200).json({ message: "Welcome to the dashboard", username: req.user.username });
});


router.post('/create', authenticateJWT, upload.single('image'), async (req, res) => {
    try {
        const { name, email, mobile, designation, gender, course } = req.body;
        const employee = new Employee({
            name,
            email,
            mobile,
            designation,
            gender,
            course,
            imageUrl: req.file ? req.file.path : null  
        });
        await employee.save();
        res.status(200).json(employee);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.get("/list", authenticateJWT, async (req, res) => {
    res.json(await Employee.find());
});


router.put('/employee/:id', authenticateJWT, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobile, designation, gender, course } = req.body;

        const updatedData = {
            name,
            email,
            mobile,
            designation,
            gender,
            course,
        };

        if (req.file) {
            updatedData.imageUrl = req.file.path;  
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            updatedData,
            { new: true, runValidators: true } 
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found!" });
        }

        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: "Error updating employee", error: error.message });
    }
});



router.delete("/employee/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const emp = await Employee.findById(id);
        if (!emp) {
            return res.status(404).send("Employee not found!!");
        }
        await Employee.findByIdAndDelete(id);
        res.status(200).send("Employee Details Deleted Successfully!!");
    } catch (error) {
        res.status(400).send("Error deleting the employee details!!");
    }
});

router.get('/employee/:id', authenticateJWT, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error });
    }
});



module.exports = router;
