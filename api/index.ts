export default async function handler(req: any, res: any) {
    if (req.url === '/api/debug' || req.query.debug === 'true') {
        try {
            const start = Date.now();
            let log = "Starting debug...\\n";

            try {
                const express = require('express');
                log += "\\nExpress loaded ok.";
            } catch (e: any) {
                log += "\\nExpress failed: " + e.message;
            }

            try {
                const { PrismaClient } = require('../server/prisma/generated/client');
                const prisma = new PrismaClient();
                log += "\\nPrisma client instantiated ok.";
            } catch (e: any) {
                log += "\\nPrisma failed: " + e.message;
            }

            try {
                const app = require('../server/src/index');
                log += "\\nServer Index loaded ok.";
            } catch (e: any) {
                log += "\\nServer Index failed: " + e.message + "\\n" + String(e.stack);
            }

            return res.status(200).send(`DEBUG LOG:\\n${log}\\nTime: ${Date.now() - start}ms`);
        } catch (err: any) {
            return res.status(500).send("Outer catch: " + err.message + "\\n" + String(err.stack));
        }
    }

    try {
        const app = require('../server/src/index');
        return app.default ? app.default(req, res) : app(req, res);
    } catch (e: any) {
        return res.status(500).send("Fatal load error: " + e.message + "\\n" + String(e.stack));
    }
}
