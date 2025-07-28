import ballerina/http;

string apiKey ="af48587254ee42488769cafb91891908";


@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service / on new http:Listener(8060) {

    resource function get news() returns json|error {
       // log:printInfo("Received request for women's health and cancer news");

        http:Client newsApiClient = check new("https://newsapi.org", timeout = 60);

        map<string> headers = { "X-Api-Key": apiKey };

        string queryParams = "/v2/everything?q=(women+health+OR+breast+cancer+OR+ovarian+cancer+OR+reproductive+health+OR+maternal+health+OR+female+healthcare+OR+gynecology+OR+cervical+cancer+OR+fertility+OR+hormonal+health)&sortBy=publishedAt&pageSize=100&language=en&sources=medical-news-today,healthline,npr,cnn,bbc-news,the-guardian";

       // log:printInfo("Sending request to NewsAPI");

        http:Response|error response = newsApiClient->get(queryParams, headers);

        if (response is error) {
            //log:printError("Error calling NewsAPI", 'error = response);
            return error("Failed to fetch news: " + response.message());
        }

        if (response.statusCode == 200) {
            json|error jsonResponse = response.getJsonPayload();
            if (jsonResponse is error) {
               // log:printError("Error parsing JSON response", 'error = jsonResponse);
                return error("Failed to parse news data");
            }
            return jsonResponse;
        } else {
           // log:printError("HTTP error from NewsAPI", statusCode = response.statusCode);
            return error("Failed to fetch news: HTTP " + response.statusCode.toString());
        }
    }
}

