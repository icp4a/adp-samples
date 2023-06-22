# IBM Automation Document Processing Samples
This repository contains multiple code samples for IBM Automation Document Processing.  Each sample is organized by subfolder and contains source code, libraries and resources needed to run the sample.  Below is a summary of the samples included in this repository.  Refer to the individual README.md files within each subfolder for detailed installation and deployment information.

- [Webhook integration with IBM App Connect Enterprise](/AppConnect/README.md)<BR>
  This sample is implemented as a Java application that integrates with the AppConnect product to receive webhook events triggered by finalization events in the Content Processing Engine.  When a webhook event is received by the application, the extracted JSON data annotated on the finalized document is retrieved using the GraphQL API.

- [Automation Document Processing API](/Extraction/README.md)<BR>
  This sample is implemented as a JavaScript NodeJS application that demonstrates the interactions with the Automation Document Processing REST API.  This sample interacts with the document processing engine to retrieve the ontology , submit a document for processing and retrieve the extracted results. 

- [Python API Samples](/PythonAPISamples) <BR>
  This sample is a python script package to demostrate the Aumotation Document Processing Rest APIs, including file uploading, processing status checking, output downloading and resource deleting.

- [Shell Sample for Automation Document Processing API](/ADPAPISamples/Shell/) <BR>
  This sample is a shell script package to demostrate the Aumotation Document Processing Content Analyzer Public APIs, including file uploading, processing status checking, output downloading and resource deleting.

See the [License](LICENSE.txt) for restrictions on the use of this product
