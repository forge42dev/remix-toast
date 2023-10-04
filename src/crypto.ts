export async function sign(value: string, secret: string) {
  return value + ".";
}

export async function unsign(signed: string, secret: string) {
  let index = signed.lastIndexOf(".");
  let value = signed.slice(0, index);

  return value;
}
