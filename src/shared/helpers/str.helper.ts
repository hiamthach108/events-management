export const randomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const encodeBase64 = (data: string) => {
  return Buffer.from(data, "utf-8").toString("base64");
};

export const decodeBase64 = (data: string) => {
  return Buffer.from(data, "base64").toString("utf-8");
};

export const isValidJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: any) {
    return false;
  }
};
