import { Router } from 'express';

const route = Router();


const _route = Router();
_route.use('/expenses', route);

export default _route;