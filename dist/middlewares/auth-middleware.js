"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeAuth = void 0;
const fakeAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token !== 'Bearer faketoken123') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { id: 1, name: 'Test User' };
    next();
};
exports.fakeAuth = fakeAuth;
