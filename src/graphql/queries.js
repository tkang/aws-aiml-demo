/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getImageData = /* GraphQL */ `
  query GetImageData($id: ID!) {
    getImageData(id: $id) {
      id
      imageKey
      rekognitionData
      imageTypes
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listImageDatas = /* GraphQL */ `
  query ListImageDatas(
    $filter: ModelImageDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listImageDatas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        imageKey
        rekognitionData
        imageTypes
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
