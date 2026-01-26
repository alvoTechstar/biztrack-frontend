import DatabaseService from "./DatabaseService";

export const GET = (endPointUrl, key) => {
  return DatabaseService.GET(endPointUrl, key);
};

export const DELETE = (endPointUrl, dataObj) => {
  return DatabaseService.DELETE(endPointUrl, dataObj);
};

export const POST = (endPointUrl, dataObj) => {
  return DatabaseService.POST(endPointUrl, dataObj);
};

export const POST_LOGIN = (endPointUrl, dataObj) => {
  return DatabaseService.POST_LOGIN(endPointUrl, dataObj);
};

export const GET_STATUS = (endPointUrl) => {
  return DatabaseService.GET_STATUS(endPointUrl);
};

export const PUT = (endPointUrl, dataObj) => {
  return DatabaseService.PUT(endPointUrl, dataObj);
};

export const PUT_LOGIN = (endPointUrl, dataObj) => {
  return DatabaseService.PUT_LOGIN(endPointUrl, dataObj);
};

export const getIp = (endPointUrl) => {
  return DatabaseService.GET_IP(endPointUrl);
};
