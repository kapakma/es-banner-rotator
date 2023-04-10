//get enum value
export function getEnum(val, list, defaultVal) {
  return (-1 < $.inArray(val, list) ? val : defaultVal);
}