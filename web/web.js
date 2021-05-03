module.exports = function (app) {
    app.get('/test.html', function (request, response) {
        console.log(request.body);
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end('Hello World!\n');
    });
};