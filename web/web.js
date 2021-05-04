module.exports = function (app) {
    app.get('api/test', function (request, response) {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end('Hello World 12345!\n');
    });
};