const stringToBoolean: boolean = (string: string) => {
  if (string === "true") {
    return true;
  }
  return false;
};

export { stringToBoolean };
