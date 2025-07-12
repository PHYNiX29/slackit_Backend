import express from 'express';
import bodyParser from "body-parser";
import bcrypt from 'bcrypt';
import { authenticateToken, generateJwtToken, generateRefreshToken } from '../middleware/authMiddleware.js';
import { User } from '../models/user1.model.js';
// import sendMail from '../utils/email.js'; 
import dotenv from "dotenv";
import { logger } from '../../app.js';  // Adjust the path to app.js

dotenv.config();

const app = express();
const router = express.Router();
app.use(bodyParser.json());

const signUpQue = [];
let signUpIsLocked = false;
let currentSignUp = [];

router.post('/signup', async (req, res) => {
    res.clearCookie("G_ENABLED_IDPS");
    const userReq = req.body
    if (signUpIsLocked) {
            signUpQue.push(userReq);
    }
    else{
        signUpIsLocked = true;
        currentSignUp.push(userReq);
        const result = await signUp(userReq);
        res.json(result);
    }

    while (signUpQue.length > 0) {
        const next_data = signUpQue.shift();
        const result_qued = await signUp(next_data);
        res.json(result_qued);
    }

    signUpIsLocked = false;

    async function signUp(userData) {
        try {
            console.log(userData);
            const timestamp = new Date().toISOString();
            console.log(`Request from signup at ${timestamp}`);

            // Validate empty fields
            if (!userData.username || !userData.email || !userData.password) {
                return { err: "Fill all details" };
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                return { err: 'Email already has an account associated with it. Please log in.' };
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create new user
            const newUser = await User.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                // role: 'user' // optional because default is set in schema
            });

            // Optional: Send welcome email
            // await sendMail(userData.username, userData.email);

            return { redirect: 'login' };
        } catch (error) {
            console.error('Signup error:', error);
            return { err: 'Something went wrong. Please try again.' };
        }
    }

});

router.post('/signup', async (req, res) => {
    res.clearCookie("G_ENABLED_IDPS");
    const userReq = req.body
    if (signUpIsLocked) {
            signUpQue.push(userReq);
    }
    else{
        signUpIsLocked = true;
        currentSignUp.push(userReq);
        const result = await signUp(userReq);
        res.json(result);
    }

    while (signUpQue.length > 0) {
        const next_data = signUpQue.shift();
        const result_qued = await signUp(next_data);
        res.json(result_qued);
    }

    signUpIsLocked = false;

    async function signUp(userData) {
        try {
            console.log(userData);
            const timestamp = new Date().toISOString();
            console.log(`Request from signup at ${timestamp}`);

            // Validate empty fields
            if (!userData.username || !userData.email || !userData.password) {
                return { err: "Fill all details" };
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                return { err: 'Email already has an account associated with it. Please log in.' };
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create new user
            const newUser = await User.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                role: 'admin' // optional because default is set in schema
            });

            // Optional: Send welcome email
            // await sendMail(userData.username, userData.email);

            return { redirect: 'login' };
        } catch (error) {
            console.error('Signup error:', error);
            return { err: 'Something went wrong. Please try again.' };
        }
    }

});



router.post('/login', async (req, res) => {
    res.clearCookie("G_ENABLED_IDPS");

    try {
        const timestamp = new Date().toISOString();
        console.log(`Request from ${req.ip} on /login route at ${timestamp} on port ${req.socket.localPort}`);

        const { email, password } = req.body;

        // Basic empty field check
        if (!email || !password) {
            return res.json({ err: "Fill all details" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ err: "Invalid email or password" });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.json({ err: "Account has been banned by admin" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ err: "Invalid email or password" });
        }

        // Generate tokens
        const accessToken = generateJwtToken({ _id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ _id: user._id, role: user.role });

        // Set cookies
        res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "Lax" });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "Lax" });
        
        res.json({ redirect: "home" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});


router.get("/checkAuth", authenticateToken, (req, res) => {
    res.json({ authenticated: true });
    const timestamp = new Date().toISOString();
    console.log(`Request from ${req.ip} on /checkAuth route at ${timestamp} on port ${req.socket.localPort}`);
    // logger.info(`Request from ${req.ip} on /checkAuth route at ${timestamp}`);
});

router.get("/checkAdmin", authenticateToken, (req, res) => {
    if(req.user.role==="admin"){
        res.json({ authenticated: true });
    }else{
        res.json({ authenticated: false });
    }
    const timestamp = new Date().toISOString();
    console.log(`Request from ${req.ip} on /checkAuth route at ${timestamp} on port ${req.socket.localPort}`);
    // logger.info(`Request from ${req.ip} on /checkAuth route at ${timestamp}`);
});

router.post("/logout", (req, res) => {
    // Clear the authentication token or session here
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logout successful" });
    
});

export default router;