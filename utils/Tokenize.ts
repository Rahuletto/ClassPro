function createToken(secretKey: string, message?: string, url?:string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${message ? "" : (timestamp + ".")}${secretKey}${message ? `.${message}.${encode(message)}.${url}` : ""}`;
  const encodedData = btoa(data);
  return encodedData;
}

export const token = () =>
  createToken(process.env.NEXT_PUBLIC_VALIDATION_KEY || "");

export const authHash = (reg: string, url: string) =>
  createToken(process.env.NEXT_PUBLIC_VALIDATION_KEY || "", reg || "", url || "");

export function encode(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str?.length; i++) {
    hash ^= str.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (
    (hash >>> 0).toString() +
    (hash >>> 1).toString(16) +
    (hash >>> 2).toString(32)
  );
}
