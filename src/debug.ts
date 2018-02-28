import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    const data = {
        body: req.body,
        cookies: req.cookies,
        session: req.session,
        params: req.params,
        query: req.query
    };
    resp.send(
        `<h1>Server</h1>
        <pre>${JSON.stringify(data, null, 4)}</pre>
        <h1>Client</h1>
        <pre id="client"></pre>
        <script>
        document.getElementById('client').innerText = JSON.stringify({
            cookie : document.cookie
        },null,4);
        </script>`);
});

const _route = Router();
_route.use('/debug', route);

export default _route;