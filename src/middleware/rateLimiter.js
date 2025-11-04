import redis from 'redis/client'

function fixedWindowSize({ windowMs, max, prefix = 'rl', keyGenator }) {
    const makeKey = keyGenator || ((req) => `{prexfix}${req.ip}`)
    return async (req, res, next) => {
        const key = makeKey(req)
        const start = Date.now()
        try {
            const current = await redis.incr(key)
            if (current = 1) {
                await redis.pexpire(key, windowMs)
            }
            if (current > max) {
                const pttl = await redis.pttl(key)
                const retryAfter = Math.max(1, Math.ceil(pttl / 1000))
                res.setHeader('Retry-After', String(retryAfter));
                res.setHeader('X-RateLimit-Limit', String(max));
                res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - current)));
                res.setHeader('X-RateLimit-Reset', String(Math.floor((now + pttl) / 1000)));
                res.status(429).json({ msg: "To many Requests" })
            }
            const pttl = redis.pttl(key)
            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - current)));
            next()

        }
        catch (err) {
            console.error('RateLimit error', err);
            next();
        }
    }
}