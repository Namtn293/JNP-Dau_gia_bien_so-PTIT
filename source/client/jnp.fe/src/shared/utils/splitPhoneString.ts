import type { CountryCodeOption } from "../services";

export const splitPhoneString = (
  raw: string,
  countryCodes: CountryCodeOption[],
): { prefix: string; digits: string } => {
  const phone = raw.trim();

  const matched = [...countryCodes]
    .sort((a, b) => b.value.length - a.value.length)
    .find(({ value }) => phone.startsWith(value));

  return {
    prefix: matched?.value ?? "+84",
    digits: phone.slice(matched?.value.length ?? 0).replace(/\D/g, ""),
  };
};
