const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.REGION });
const rekognition = new AWS.Rekognition();
const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
const { print } = graphql;
const { v4: uuidv4 } = require("uuid");

const saveData = gql`
  mutation CreateImageData($input: CreateImageDataInput!) {
    createImageData(input: $input) {
      id
      imageKey
      rekognitionData
      createdAt
      updatedAt
    }
  }
`;

exports.handler = function (event, context) {
  //eslint-disable-line
  var params = {
    Image: {
      S3Object: {
        Bucket: process.env.BUCKET,
        Name: "public/" + event.arguments.imageKey,
      },
    },
    MaxLabels: 10,
    MinConfidence: 70,
  };

  console.log("params = ", params);

  rekognition.detectLabels(params, function (err, data) {
    if (err) {
      console.log("err = ", err);
      context.done(err);
    } else {
      const rekognitionData = JSON.stringify(data);
      axios({
        url: process.env.APPSYNC_ENDPOINT,
        method: "post",
        headers: {
          "x-api-key": process.env.APPSYNC_KEY,
        },
        data: {
          query: print(saveData),
          variables: {
            input: {
              imageKey: event.arguments.imageKey,
              rekognitionData,
            },
          },
        },
      })
        .then((successData) => {
          console.log("successData = ", successData);
          console.log("successData.data = ", successData.data);
          console.log("successData.data.data = ", successData.data.data);

          const {
            id,
            imageKey,
            rekognitionData,
            createdAt,
            updatedAt,
          } = successData.data.data.createImageData;
          const graphqlData = {
            id,
            imageKey,
            rekognitionData,
            createdAt,
            updatedAt,
          };
          context.done(null, graphqlData);
        })
        .catch((err) => context.done(err));
    }
  });
};
