import 'dotenv/config'

const env = (key,def)=>process.env[key] ?? def

export const PORT = Number(env('PORT',3000))
export const ACCESS_SECERT = env('ACCESS_SECERT','dev-access')
export const REFRESH_SECRET = env('REFRESH_SECRET', 'dev-refresh');
export const ACCESS_TTL  = env('ACCESS_TTL',  '900s');
export const REFRESH_TTL = env('REFRESH_TTL', '7d');

