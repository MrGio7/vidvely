# Vidvely

Vidvely is a video conferencing web application, similar to Google Meet, built using Next.js for the front-end, AWS Serverless Lambda for the backend, and AWS DynamoDB for the database. The app also utilizes AWS Chime for video streaming and AWS Cognito for federated authentication.

## Getting Started

To get started with Vidvely, clone the repository to your local machine and install the necessary dependencies.

git clone https://github.com/your-username/vidvely.git
cd vidvely
npm install

### Setting Up AWS Services

Before running the app, you will need to set up the necessary AWS services. This includes creating a DynamoDB table, setting up AWS Chime, and configuring AWS Cognito.

### Running the App

To run the app, start the front-end and backend servers:

npm run dev

This will start the Next.js development server and the AWS Serverless Lambda function. You can access the app at http://localhost:3000.

Alternatively, you can visit the hosted version of the app at https://vidvely.vercel.app/.

## Contributing

Contributions to Vidvely are welcome! To contribute, fork the repository and create a new branch for your changes. Once you have made your changes, submit a pull request and your changes will be reviewed.

## License

Vidvely is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
