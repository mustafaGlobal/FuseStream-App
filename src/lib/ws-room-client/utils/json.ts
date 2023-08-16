type Result<T, E> = [T, E];

const unmarshallJSON = (data: any): Result<any, unknown> => {
  let result = null;
  try {
    result = JSON.parse(data);
  } catch (error) {
    return [null, error];
  }
  return [result, null];
};

const marshallJSON = (data: any): Result<any, unknown> => {
  let result = null;
  try {
    result = JSON.stringify(data);
  } catch (error) {
    return [null, error];
  }
  return [result, null];
};

export { unmarshallJSON, marshallJSON, Result };
