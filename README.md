# AZ Service Catalog SPA

This app will use the AZ Serice Catalog Middleware to retrieve a list of template folder from GitHib and present them in a Service Catalog.

## Installation

1. To install this HTML/JS SPA application, edit the ./js/main.js file and update the below section, with your Azure Function App configuration.

        // Azure Function App Uri
        const uri = "https://<<YOUR FUNCTION APP>>-fa.azurewebsites.net/api/";
        // Azure Function App Host Key
        const code = "<<YOUR FUNCTION APP HOST KEY>";

2. Create an Azure Storage account and Container.

3. Enable Static Webhosting and set the default file to index.html

4. Copy the contents of this folder to the $web container in the Azure Storage Account.

5. Update CORS on the Azure Function App and add the Static Website hosting URL for your Azure Storage.
