export function convertUnicode(input: string) {
  return input.replace(/\\+u([0-9a-fA-F]{4})/g, (a, b) =>
    String.fromCharCode(parseInt(b, 16)),
  );
}
export function truncateString(str: string) {
  if (str.length <= 50) {
    return str;
  } else {
    return str.slice(0, 50) + "...";
  }
}
